import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {InfoOrdine} from '../../model/ordine.model';
import {OrdiniService} from '../../services/ordini.service';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {DocumentiService} from '../../services/documenti.service';
import {Modello4Service} from '../../services/modello4.service';
import {Modello4Response, Modello4RigaResponse, Modello4UpdateRequest} from '../../model/modello4.model';
import {NotificationModel} from '../../model/notification.model';
import {CONSTANTS} from '../../shared/constants';

declare var bootstrap: any;

@Component({
  selector: 'app-vendite',
  imports: [ReactiveFormsModule],
  templateUrl: './vendite.component.html',
  styleUrl: './vendite.component.css'
})
export class VenditeComponent implements OnInit, OnDestroy {
  loading = false;
  protected orders: InfoOrdine[] | null = null;
  protected notification?: NotificationModel;
  protected showNotifications: boolean = false;
  modello4Form!: FormGroup;
  private modello4OrderId?: number;

  private subscriptions: Subscription[] = [];
  private orderService = inject(OrdiniService);
  private documentiService = inject(DocumentiService);
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
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
    this.subscriptions.forEach(subscription => {
      console.log('I am unsubscribing subscription');
      subscription.unsubscribe()
    });
  }

  private getOrders() {
    this.loading = true;
    const subscription = this.orderService.getOrdini().subscribe({
      next: (response) => {
        this.orders = response.body;
        this.loading = false;
      },
      error: (error) => {
        this.subscriptions.push(subscription);
        this.loading = false;
      },
      complete: () => {
        this.subscriptions.push(subscription);
      }
    })
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

  handleVendita(event: MouseEvent, orderId?: number) {

    if (orderId) {
      this.router.navigate(['/gestione-vendite'], {queryParams: {id: orderId}});
    } else {
      const target = event.currentTarget as HTMLElement;
      const tooltipInstance = bootstrap.Tooltip.getInstance(target);
      tooltipInstance?.hide();  // chiude il tooltip
      this.router.navigate(['/gestione-vendite']);
    }
  }

  // --- Modifica Modello 4 ---

  private initModello4Form(): void {
    this.modello4Form = this.fb.group({
      dataDocumento: ['', Validators.required],
      clienteNome: ['', Validators.required],
      clienteCognome: ['', Validators.required],
      clienteIndirizzo: ['', Validators.required],
      clienteComune: ['', Validators.required],
      clienteProvincia: ['', Validators.required],
      righe: this.fb.array([]),
    });
  }

  get modello4Righe(): FormArray {
    return this.modello4Form.get('righe') as FormArray;
  }

  private newModello4RigaRow(riga: Modello4RigaResponse): FormGroup {
    return this.fb.group({
      id: [riga.id],
      specie: [riga.specie, Validators.required],
      contenitori: [riga.contenitori],
      quantita: [riga.quantita, [Validators.required, Validators.min(1)]],
      codiciDiProvenienza: [riga.codiciDiProvenienza, Validators.required],
    });
  }

  openModello4Modal(order: InfoOrdine): void {
    this.modello4OrderId = order.id;

    const subscription = this.modello4Service.getModello4(order.id).subscribe({
      next: (response) => {
        const modello4 = response.body as Modello4Response;
        this.populateModello4Form(modello4);
        this.showModello4Modal();
      },
      error: (error) => {
        this.subscriptions.push(subscription);
      },
      complete: () => {
        this.subscriptions.push(subscription);
      }
    });
  }

  private populateModello4Form(modello4: Modello4Response): void {
    this.modello4Form.patchValue({
      dataDocumento: modello4.dataDocumento,
      clienteNome: modello4.clienteNome,
      clienteCognome: modello4.clienteCognome,
      clienteIndirizzo: modello4.clienteIndirizzo,
      clienteComune: modello4.clienteComune,
      clienteProvincia: modello4.clienteProvincia,
    });

    this.modello4Righe.clear();
    modello4.righe.forEach(riga => this.modello4Righe.push(this.newModello4RigaRow(riga)));
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
      dataDocumento: raw.dataDocumento,
      clienteNome: raw.clienteNome,
      clienteCognome: raw.clienteCognome,
      clienteIndirizzo: raw.clienteIndirizzo,
      clienteComune: raw.clienteComune,
      clienteProvincia: raw.clienteProvincia,
      righe: raw.righe,
    };

    const subscription = this.modello4Service.updateModello4(this.modello4OrderId, payload).subscribe({
      next: () => {
        this.showNotifications = true;
        this.notification = {title: CONSTANTS.update_modello4_success};
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
