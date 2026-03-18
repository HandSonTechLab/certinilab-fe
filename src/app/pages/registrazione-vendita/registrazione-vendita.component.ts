import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Locale} from '../../model/locale.model';
import {CommonModule} from '@angular/common';
import {AnimaleDisponibile, DettaglioOrdineRequest, OrderType, OrdineCreateRequest} from '../../model/ordine.model';
import {ClientsService} from '../../services/clients.service';
import {LocaliService} from '../../services/locali.service';
import {debounceTime, distinctUntilChanged, of, Subscription, switchMap} from 'rxjs';
import {ClientDtoModel} from '../../model/client-dto.model';
import {HttpResponse} from '@angular/common/http';
import {SearchClientsResponse} from '../../model/search-clients-response.data';
import {LottiService} from '../../services/lotti.service';
import {OrdiniService} from '../../services/ordini.service';

@Component({
  selector: 'app-registrazione-vendita',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registrazione-vendita.component.html',
  styleUrl: './registrazione-vendita.component.css'
})
export class RegistrazioneVenditaComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientsService);
  private lottiService = inject(LottiService);
  private localiService = inject(LocaliService);
  private ordineService = inject(OrdiniService);
  protected readonly OrderType = OrderType;
  clienteSearch = new FormControl('');
  clienti: ClientDtoModel[] = [];
  locali: Locale[] = [];
  animaliPerLocale: Record<number, AnimaleDisponibile[]> = {};

  form!: FormGroup;
  isEditMode = false;
  ordineId?: number;

  // totali computati
  totaleAnimali = signal(0);
  totaleMangime = signal(0);
  totaleScatole = signal(0);
  totaleOrdine = computed(
    () =>
      this.totaleAnimali() +
      this.totaleMangime() +
      this.totaleScatole()
  );

  ngOnInit(): void {
    this.initForm();
    this.loadLocali();
    this.loadClienti();

    this.route.queryParamMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.isEditMode = true;
        this.ordineId = +idParam;
        this.loadOrdine(this.ordineId);
      }
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      data: [this.today(), Validators.required],
      idCliente: [null, Validators.required],
      noteOrdine: [''],

      // internamente calcolati
      spesaScatole: [{value: 0, disabled: true}],
      spesaMangime: [{value: 0, disabled: true}],

      // note auto-generate al submit
      noteScatole: [''],
      noteMangime: [''],

      dettagliAnimali: this.fb.array([]),
      mangimi: this.fb.array([]),
      scatole: this.fb.array([]),
    });

    // almeno una riga animali di default
    this.addRigaAnimale();
  }

  // getter brevi
  get dettagliAnimali(): FormArray {
    return this.form.get('dettagliAnimali') as FormArray;
  }

  get mangimi(): FormArray {
    return this.form.get('mangimi') as FormArray;
  }

  get scatole(): FormArray {
    return this.form.get('scatole') as FormArray;
  }


  newRigaAnimale(): FormGroup {
    return this.fb.group({
      localeId: [null, Validators.required],
      animaleId: [null, Validators.required],
      dataDiNascita: [null, Validators.required],
      fornitoreId: [null, Validators.required],
      codiceProvenienza: [null, Validators.required],
      idLotto: [null, Validators.required], // valorizzato quando scegli animale
      tipoVendita: ['AL_KG', Validators.required], // AL_KG | PER_UNITA
      quantita: [1, [Validators.required, Validators.min(1)]],
      peso: [null], // validato dinamicamente
      prezzoUnitario: [null, [Validators.required, Validators.min(0.01)]],
      totaleRiga: [{value: 0, disabled: true}],
      note: [''],
    });
  }

  addRigaAnimale(): void {
    this.dettagliAnimali.push(this.newRigaAnimale());
  }

  private today(): string {
    const d = new Date();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  removeRigaAnimale(index: number): void {
    if (this.dettagliAnimali.length > 1) {
      this.dettagliAnimali.removeAt(index);
      this.calcolaTotaleAnimali();
    }
  }

  onLocaleChange(index: number): void {
    const group = this.dettagliAnimali.at(index) as FormGroup;
    group.patchValue({animaleId: null, idLotto: null, dataDiNascita: null, codiceProvenienza: null});
    const localeId = group.get('localeId')?.value;
    if (localeId) {
      this.loadAnimaliPerLocale(localeId);
    }
  }

  onAnimaleChange(index: number): void {
    const group = this.dettagliAnimali.at(index) as FormGroup;
    const localeId = group.get('localeId')?.value;
    const animaleId = group.get('animaleId')?.value;
    if (!localeId || !animaleId) return;

    const lista = this.animaliPerLocale[localeId] || [];
    const found = lista.find(a => a.idAnimale === animaleId);
    if (found) {
      group.get('idLotto')?.setValue(found.idLotto);
      group.get('dataDiNascita')?.setValue(found.dataDiNascita);
      group.get('codiceProvenienza')?.setValue(found.codiceProvenienza);
      group.get('fornitoreId')?.setValue(found.fornitoreId);
      group.get('prezzoUnitario')?.setValue(found.prezzoUnitario ? found.prezzoUnitario : null);
    }

  }

  onTipoVenditaChange(index: number): void {
    const group = this.dettagliAnimali.at(index) as FormGroup;
    const tipo = group.get('tipoVendita')?.value;
    if (tipo === 'AL_KG') {
      group.get('peso')?.setValidators([Validators.required, Validators.min(0.01)]);
    } else {
      group.get('peso')?.clearValidators();
      group.get('peso')?.setValue(null);
    }
    group.get('peso')?.updateValueAndValidity();
    this.ricalcolaTotaleRiga(index);
  }

  onValoriRigaChange(index: number): void {
    this.ricalcolaTotaleRiga(index);
  }

  private ricalcolaTotaleRiga(index: number): void {
    const group = this.dettagliAnimali.at(index) as FormGroup;
    const tipo = group.get('tipoVendita')?.value;
    const quantita = +group.get('quantita')?.value || 0;
    const peso = +group.get('peso')?.value || 0;
    const prezzo = +group.get('prezzoUnitario')?.value || 0;

    let totale = 0;
    if (tipo === 'AL_KG') {
      totale = peso * prezzo;
    } else {
      totale = quantita * prezzo;
    }

    group.get('totaleRiga')?.setValue(totale, {emitEvent: false});
    this.calcolaTotaleAnimali();
  }

  private calcolaTotaleAnimali() {
    const tot = this.dettagliAnimali.controls.reduce((sum, ctrl) => {
      const val = (ctrl as FormGroup).get('totaleRiga')?.value || 0;
      return sum + Number(val);
    }, 0);
    this.totaleAnimali.update(() => tot);
  }

  // --- mangimi ---

  newRigaMangime(): FormGroup {
    return this.fb.group({
      descrizione: [''],
      prezzoAlKg: [null, [Validators.required, Validators.min(0.01)]],
      kg: [null, [Validators.required, Validators.min(0.01)]],
      totaleRiga: [{value: 0, disabled: true}],
    });
  }

  addRigaMangime(): void {
    this.mangimi.push(this.newRigaMangime());
  }

  removeRigaMangime(index: number): void {
    this.mangimi.removeAt(index);
    this.calcolaTotaleMangime();
  }

  onValoriMangimeChange(index: number): void {
    const group = this.mangimi.at(index) as FormGroup;
    const prezzo = +group.get('prezzoAlKg')?.value || 0;
    const kg = +group.get('kg')?.value || 0;
    const totale = prezzo * kg;
    group.get('totaleRiga')?.setValue(totale, {emitEvent: false});
    this.calcolaTotaleMangime();
  }

  private calcolaTotaleMangime() {
    const tot = this.mangimi.controls.reduce((sum, ctrl) => {
      const val = (ctrl as FormGroup).get('totaleRiga')?.value || 0;
      return sum + Number(val);
    }, 0);
    this.totaleMangime.update(() => tot);
  }

  newRigaScatola(): FormGroup {
    return this.fb.group({
      descrizione: [''],
      prezzoUnitario: [null, [Validators.required, Validators.min(0.01)]],
      quantita: [null, [Validators.required, Validators.min(1)]],
      totaleRiga: [{value: 0, disabled: true}],
    });
  }

  addRigaScatola(): void {
    this.scatole.push(this.newRigaScatola());
  }

  removeRigaScatola(index: number): void {
    this.scatole.removeAt(index);
    this.calcolaTotaleScatole();
  }

  onValoriScatolaChange(index: number): void {
    const group = this.scatole.at(index) as FormGroup;
    const prezzo = +group.get('prezzoUnitario')?.value || 0;
    const quantita = +group.get('quantita')?.value || 0;
    const totale = prezzo * quantita;
    group.get('totaleRiga')?.setValue(totale, {emitEvent: false});
    this.calcolaTotaleScatole();
  }

  private calcolaTotaleScatole() {
    const tot = this.scatole.controls.reduce((sum, ctrl) => {
      const val = (ctrl as FormGroup).get('totaleRiga')?.value || 0;
      return sum + Number(val);
    }, 0);
    this.totaleScatole.update(() => tot);
  }

  // --- submit ---

  onAnnulla(): void {
    this.router.navigate(['']); // adatta tu la lista
  }

  handleOrdine(orderType: OrderType): void {
    if (this.form.invalid || this.dettagliAnimali.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildOrdineCreateRequest(orderType);

    this.ordineService.createOrdine(payload)
      .subscribe({
        next: (res) => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          // gestione errore (alert ecc.)
        }
      });
  }

  private buildOrdineCreateRequest(orderType: OrderType): OrdineCreateRequest {
    const raw = this.form.getRawValue();

    // calcoli totali da FormArray
    const spesaMangime = this.mangimi.controls.reduce((sum, ctrl) =>
      sum + Number((ctrl as FormGroup).get('totaleRiga')?.value || 0), 0);

    const spesaScatole = this.scatole.controls.reduce((sum, ctrl) =>
      sum + Number((ctrl as FormGroup).get('totaleRiga')?.value || 0), 0);

    const noteMangime = this.buildNoteMangime();
    const noteScatole = this.buildNoteScatole();

    const dettagli: DettaglioOrdineRequest[] = this.dettagliAnimali.controls.map(ctrl => {
      const g = ctrl as FormGroup;
      return {
        id: null,
        idLotto: g.get('idLotto')?.value,
        quantita: g.get('quantita')?.value,
        peso: g.get('peso')?.value,
        prezzoUnitario: g.get('prezzoUnitario')?.value,
        note: g.get('note')?.value || null,
        venditaType: g.get('tipoVendita')?.value, // 'AL_KG' | 'PER_UNITA'
      };
    });

    return {
      data: raw.data,
      idCliente: raw.idCliente,
      noteOrdine: raw.noteOrdine || null,
      noteScatole,
      noteMangime,
      stato: orderType,
      spesaScatole,
      spesaMangime,
      dettagli,
    } as OrdineCreateRequest;
  }


  private buildNoteMangime(): string {
    if (this.mangimi.length === 0) return '';
    const parts: string[] = [];

    this.mangimi.controls.forEach((ctrl, idx) => {
      const g = ctrl as FormGroup;
      const desc = g.get('descrizione')?.value || `Mangime ${idx + 1}`;
      const prezzo = g.get('prezzoAlKg')?.value;
      const kg = g.get('kg')?.value;
      const tot = g.get('totaleRiga')?.value;
      parts.push(`${desc}: ${prezzo} €/kg x ${kg} kg = ${tot} €`);
    });

    return parts.join(' | ');
  }

  private buildNoteScatole(): string {
    if (this.scatole.length === 0) return '';
    const parts: string[] = [];

    this.scatole.controls.forEach((ctrl, idx) => {
      const g = ctrl as FormGroup;
      const desc = g.get('descrizione')?.value || `Scatole ${idx + 1}`;
      const prezzo = g.get('prezzoUnitario')?.value;
      const qta = g.get('quantita')?.value;
      const tot = g.get('totaleRiga')?.value;
      parts.push(`${desc}: ${prezzo} € x ${qta} = ${tot} €`);
    });

    return parts.join(' | ');
  }

  private loadClienti(): void {
    this.clienteSearch.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((termRaw) => {
        const term = (termRaw || '').trim();

        if (!term) {
          return of([]);
        }

        const parts = term.split(/\s+/); // split su uno o più spazi
        const nome = parts[0];
        const cognome = parts.length > 1 ? parts.slice(1).join(' ') : undefined;

        return this.clientService.searchClients({nome, cognome, indirizzo: undefined}, -1, -1);
      })
    ).subscribe({
      next: (response) => {
        const searchResponse = response as HttpResponse<SearchClientsResponse>;
        this.clienti = searchResponse.body?.searchClientsDtoList || [];
      },
      error: (error) => {
      },
      complete: () => {
      }
    })
  }

  private loadLocali(): void {
    const subscription = this.localiService.getLocali().subscribe({
      next: (locali) => {
        this.locali = locali.body || [];
      },
      error: (err) => {
        console.error('Errore caricamento locali', err);
        this.subscriptions.push(subscription);
      },
      complete: () => {
        this.subscriptions.push(subscription);
      }
    })
  }

  private loadAnimaliPerLocale(localeId: number): void {
    const sub = this.lottiService.getLottiByLocaleId(localeId).subscribe({
      next: (response) => {
        const animaliDisponibili: AnimaleDisponibile[] = [];
        response.body?.forEach(element => {
          const animale: AnimaleDisponibile = {
            idLotto: element.idLotto,
            idAnimale: element.idAnimale,
            dataDiNascita: element.dataDiNascita,
            codiceProvenienza: element.codiceProvenienza,
            fornitoreId: element.fornitoreId,
            descrizione: `${element.razza} ${element.colore}`,
            prezzoUnitario: element.prezzoUnitario,
          }
          animaliDisponibili.push(animale);
        })
        this.animaliPerLocale[localeId] = animaliDisponibili;
      },
      error: (err) => {
        this.subscriptions.push(sub);
      },
      complete: () => {
        this.subscriptions.push(sub);
      }
    })
  }

  private loadOrdine(id: number): void {
    this.ordineService.getOrdineById(id).subscribe((ordine) => {

    });
  }

}
