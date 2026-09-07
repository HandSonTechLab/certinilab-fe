import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {DettaglioOrdineResponse, InfoOrdine, InfoOrdineResponse} from '../../model/ordine.model';
import {OrdiniService} from '../../services/ordini.service';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {DocumentiService} from '../../services/documenti.service';
import {ClientsService} from '../../services/clients.service';
import {AnimaliService} from '../../services/animali.service';
import {SupplierService} from '../../services/supplier.service';
import {Modello4Service} from '../../services/modello4.service';
import {ClientModel} from '../../model/client.model';
import {Animale} from '../../model/animale.model';
import {Fornitore} from '../../model/fornitore.model';
import {Modello4UpdateRequest} from '../../model/modello4.model';

declare var bootstrap: any;

@Component({
  selector: 'app-vendite',
  imports: [ReactiveFormsModule],
  templateUrl: './vendite.component.html',
  styleUrl: './vendite.component.css'
})
export class VenditeComponent implements OnInit, OnDestroy {

  protected orders?: InfoOrdine[] | null;
  protected animali: Animale[] = [];
  protected fornitori: Fornitore[] = [];
  protected modello4Form!: FormGroup;
  private modello4OrderId?: number;

  private subscriptions: Subscription[] = [];
  private orderService = inject(OrdiniService);
  private documentiService = inject(DocumentiService);
  private clientService = inject(ClientsService);
  private animaliService = inject(AnimaliService);
  private supplierService = inject(SupplierService);
  private modello4Service = inject(Modello4Service);
  private fb = inject(FormBuilder);

  constructor(private router: Router) {
  }

  ngOnInit() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el, {
      trigger: 'hover'
    }));
    this.initModello4Form();
    this.getOrders();
    this.loadAnimali();
    this.loadFornitori();
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
    this.subscriptions.forEach(subscription => {
      console.log('I am unsubscribing subscription');
      subscription.unsubscribe()
    });
  }

  private getOrders() {
    const subscription = this.orderService.getOrdini().subscribe({
      next: (response) => {
        this.orders = response.body;
      },
      error: (error) => {
        this.subscriptions.push(subscription);
      },
      complete: () => {
        this.subscriptions.push(subscription);
      }
    })
  }

  private loadAnimali(): void {
    const subscription = this.animaliService.getAnimali().subscribe({
      next: (response) => {
        this.animali = response.body || [];
      },
      error: (error) => {
        this.subscriptions.push(subscription);
      },
      complete: () => {
        this.subscriptions.push(subscription);
      }
    });
  }

  private loadFornitori(): void {
    const subscription = this.supplierService.recuperaFornitoriPerDropdown().subscribe({
      next: (response) => {
        this.fornitori = response.body || [];
      },
      error: (error) => {
        this.subscriptions.push(subscription);
      },
      complete: () => {
        this.subscriptions.push(subscription);
      }
    });
  }

  visualizzaModello4(id: number) {
    this.documentiService.generateModello4Pdf(id).subscribe({
      next: (pdfBlob) => {
        const blob = new Blob([pdfBlob], {type: 'application/pdf'});
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      }
    })
  }

  newVendita(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const tooltipInstance = bootstrap.Tooltip.getInstance(target);
    tooltipInstance?.hide();  // chiude il tooltip
    this.router.navigate(['/gestione-vendite'], {state: {userId: null, activeMode: 'create'}});
  }

  // --- Modifica Modello 4 ---

  private initModello4Form(): void {
    this.modello4Form = this.fb.group({
      data: ['', Validators.required],
      nomeCognomeCliente: ['', Validators.required],
      indirizzoCliente: ['', Validators.required],
      comuneCliente: ['', Validators.required],
      provinciaCliente: ['', Validators.required],
      dettagli: this.fb.array([]),
    });
  }

  get modello4Dettagli(): FormArray {
    return this.modello4Form.get('dettagli') as FormArray;
  }

  private newModello4DettaglioRow(det: DettaglioOrdineResponse): FormGroup {
    const specieMatch = this.animali.find(a => det.descrizioneAnimale?.startsWith(a.razza));
    return this.fb.group({
      id: [det.id],
      specie: [specieMatch?.razza || null, Validators.required],
      quantita: [det.quantita, [Validators.required, Validators.min(1)]],
      contenitori: [null, [Validators.required, Validators.min(0)]],
      codiceProvenienza: [det.codiceProvenienza || null, Validators.required],
    });
  }

  openModello4Modal(order: InfoOrdine): void {
    this.modello4OrderId = order.id;

    const subscription = this.orderService.getOrdineById(order.id).subscribe({
      next: (response) => {
        const ordine = response.body as InfoOrdineResponse;

        const clientSubscription = this.clientService.findClientById(ordine.idCliente).subscribe({
          next: (clientResponse) => {
            const cliente = clientResponse.body as ClientModel;
            this.populateModello4Form(ordine, cliente);
            this.showModello4Modal();
          },
          error: (error) => {
            this.subscriptions.push(clientSubscription);
          },
          complete: () => {
            this.subscriptions.push(clientSubscription);
          }
        });
      },
      error: (error) => {
        this.subscriptions.push(subscription);
      },
      complete: () => {
        this.subscriptions.push(subscription);
      }
    });
  }

  private populateModello4Form(ordine: InfoOrdineResponse, cliente: ClientModel): void {
    this.modello4Form.patchValue({
      data: ordine.data,
      nomeCognomeCliente: `${ordine.nomeCliente} ${ordine.cognomeCliente}`,
      indirizzoCliente: ordine.indirizzoCliente,
      comuneCliente: cliente.comune,
      provinciaCliente: cliente.provincia,
    });

    this.modello4Dettagli.clear();
    ordine.dettagli.forEach(det => this.modello4Dettagli.push(this.newModello4DettaglioRow(det)));
  }

  private showModello4Modal(): void {
    const modalEl = document.getElementById('modello4Modal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }

  salvaModello4(): void {
    if (this.modello4Form.invalid || !this.modello4OrderId) {
      this.modello4Form.markAllAsTouched();
      return;
    }

    const raw = this.modello4Form.getRawValue();
    const payload: Modello4UpdateRequest = {
      idOrdine: this.modello4OrderId,
      data: raw.data,
      nomeCliente: raw.nomeCognomeCliente,
      cognomeCliente: raw.cognomeCliente,
      indirizzoCliente: raw.indirizzoCliente,
      comuneCliente: raw.comuneCliente,
      provinciaCliente: raw.provinciaCliente,
      dettagli: raw.dettagli,
    };

    const subscription = this.modello4Service.updateModello4(this.modello4OrderId, payload).subscribe({
      next: () => {
        const modalEl = document.getElementById('modello4Modal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
        this.getOrders();
      },
      error: (error) => {
        this.subscriptions.push(subscription);
      },
      complete: () => {
        this.subscriptions.push(subscription);
      }
    });
  }
}
