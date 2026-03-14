import {Component, computed, inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Locale} from '../../model/locale.model';
import {CommonModule} from '@angular/common';
import {AnimaleDisponibile} from '../../model/ordine.model';
import {ClientsService} from '../../services/clients.service';
import {LocaliService} from '../../services/locali.service';
import {debounceTime, distinctUntilChanged, of, Subscription, switchMap} from 'rxjs';
import {ClientDtoModel} from '../../model/client-dto.model';
import {HttpResponse} from '@angular/common/http';
import {SearchClientsResponse} from '../../model/search-clients-response.data';

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
  private localiService = inject(LocaliService);
  protected readonly OrderType = OrderType;
  clienteSearch = new FormControl('');
  clienti: ClientDtoModel[] = [];

  // in realtà li popolerai dai tuoi service esistenti
  //clienti: Cliente[] = [];
  locali: Locale[] = [];
  animaliPerLocale: Record<number, AnimaleDisponibile[]> = {};

  form!: FormGroup;
  isEditMode = false;
  ordineId?: number;

  // totali computati
  totaleAnimali = computed(() => this.calcolaTotaleAnimali());
  totaleMangime = computed(() => this.calcolaTotaleMangime());
  totaleScatole = computed(() => this.calcolaTotaleScatole());
  totaleOrdine = computed(
    () =>
      this.totaleAnimali() +
      this.totaleMangime() +
      this.totaleScatole()
  );

  clientiStub: ClientDtoModel[] = [
    {
      id: 1,
      nome: 'Mario',
      cognome: 'Rossi',
      indirizzo: 'Via Roma 10',
      provincia: 'MI',
      comune: 'Milano',
      codiceIdentificativoAsl: 'ASL-MI-001'
    },
    {
      id: 2,
      nome: 'Luigi',
      cognome: 'Bianchi',
      indirizzo: 'Via Garibaldi 25',
      provincia: 'BG',
      comune: 'Bergamo',
      codiceIdentificativoAsl: 'ASL-BG-002'
    }
  ];


  ngOnInit(): void {
    this.initForm();

    // MOCK: seleziona automaticamente il primo cliente
    this.form.get('idCliente')?.setValue(this.clienti[0]?.id);

    // MOCK locali/animali
    this.mockLocaliEAnimali();

    // caricamento dropdown da tuoi service (placeholder)
    this.loadLocali();
    this.loadClienti();

    this.route.queryParamMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.isEditMode = true;
        this.ordineId = +idParam;
        //this.loadOrdine(this.ordineId);
      }
    });
  }

  private mockLocaliEAnimali(): void {
    this.locali = [
      {id: 1, nome: 'S1'},
      {id: 2, nome: 'S2'},
    ];

    // Locale 1: polli e galline
    this.animaliPerLocale[1] = [
      {
        idLotto: 101,
        dataDiNascita: '2024-01-15',
        codiceProvenienza: 'AZ-001',
        idAnimale: 1,
        descrizione: 'Gallus Bianco'
      },
      {
        idLotto: 102,
        dataDiNascita: '2024-01-15',
        codiceProvenienza: 'AZ-001',
        idAnimale: 2,
        descrizione: 'Gallus R9+R7'
      },
      {
        idLotto: 103,
        dataDiNascita: '2024-01-15',
        codiceProvenienza: 'AZ-001',
        idAnimale: 3,
        descrizione: 'Gallus Giallo'
      },
      {
        idLotto: 104,
        dataDiNascita: '2024-01-15',
        codiceProvenienza: 'AZ-001',
        idAnimale: 4,
        descrizione: 'Gallina R8+R1'
      }
    ];

    // Locale 2: altri animali
    this.animaliPerLocale[2] = [
      {
        idLotto: 201,
        idAnimale: 6,
        dataDiNascita: '2024-01-15',
        codiceProvenienza: 'AZ-001',
        descrizione: 'Gallus R5'
      },
      {
        idLotto: 202,
        idAnimale: 5,
        dataDiNascita: '2024-01-15',
        codiceProvenienza: 'AZ-001',
        descrizione: 'Gallus R9 Giallo'
      }
    ];

    // imposta una riga di esempio già piena
    const primaRiga = this.dettagliAnimali.at(0) as FormGroup;
    primaRiga.patchValue({
      localeId: 1,
      animaleId: 1,
      idLotto: 101,
      tipoVendita: 'PER_UNITA',
      quantita: 5,
      prezzoUnitario: 7.5
    });
    this.ricalcolaTotaleRiga(0);

    // aggiungo una seconda riga di esempio (vendita al kg)
    this.addRigaAnimale();
    const secondaRiga = this.dettagliAnimali.at(1) as FormGroup;
    secondaRiga.patchValue({
      localeId: 1,
      animaleId: 2,
      idLotto: 102,
      tipoVendita: 'AL_KG',
      quantita: 3,
      peso: 12.5,
      prezzoUnitario: 4.2
    });
    this.ricalcolaTotaleRiga(1);

    // mock mangimi
    this.addRigaMangime();
    const m1 = this.mangimi.at(0) as FormGroup;
    m1.patchValue({
      descrizione: 'Mangime crescita',
      prezzoAlKg: 0.55,
      kg: 30
    });
    this.onValoriMangimeChange(0);

    this.addRigaMangime();
    const m2 = this.mangimi.at(1) as FormGroup;
    m2.patchValue({
      descrizione: 'Mangime finissaggio',
      prezzoAlKg: 0.65,
      kg: 20
    });
    this.onValoriMangimeChange(1);

    // mock scatole
    this.addRigaScatola();
    const s1 = this.scatole.at(0) as FormGroup;
    s1.patchValue({
      descrizione: 'Scatole cartone grandi',
      prezzoUnitario: 0.8,
      quantita: 40
    });
    this.onValoriScatolaChange(0);

    this.addRigaScatola();
    const s2 = this.scatole.at(1) as FormGroup;
    s2.patchValue({
      descrizione: 'Scatole cartone piccole',
      prezzoUnitario: 0.6,
      quantita: 25
    });
    this.onValoriScatolaChange(1);
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
  }

  private calcolaTotaleAnimali(): number {
    return this.dettagliAnimali.controls.reduce((sum, ctrl) => {
      const val = (ctrl as FormGroup).get('totaleRiga')?.value || 0;
      return sum + Number(val);
    }, 0);
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
  }

  onValoriMangimeChange(index: number): void {
    const group = this.mangimi.at(index) as FormGroup;
    const prezzo = +group.get('prezzoAlKg')?.value || 0;
    const kg = +group.get('kg')?.value || 0;
    const totale = prezzo * kg;
    group.get('totaleRiga')?.setValue(totale, {emitEvent: false});
  }

  private calcolaTotaleMangime(): number {
    return this.mangimi.controls.reduce((sum, ctrl) => {
      const val = (ctrl as FormGroup).get('totaleRiga')?.value || 0;
      return sum + Number(val);
    }, 0);
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
  }

  onValoriScatolaChange(index: number): void {
    const group = this.scatole.at(index) as FormGroup;
    const prezzo = +group.get('prezzoUnitario')?.value || 0;
    const quantita = +group.get('quantita')?.value || 0;
    const totale = prezzo * quantita;
    group.get('totaleRiga')?.setValue(totale, {emitEvent: false});
  }

  private calcolaTotaleScatole(): number {
    return this.scatole.controls.reduce((sum, ctrl) => {
      const val = (ctrl as FormGroup).get('totaleRiga')?.value || 0;
      return sum + Number(val);
    }, 0);
  }

  // --- submit ---

  onAnnulla(): void {
    this.router.navigate(['']); // adatta tu la lista
  }

  handleOrdine(orderType: OrderType): void {

  }

  private buildRequestBody(): void {
  }

  private buildNoteMangime(): string {
    return ''
  }

  private buildNoteScatole(): string {
    return ''
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
        const cognome = parts.length > 1 ? parts.slice(1).join(' ') : '';

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
    // TODO: chiama il tuo servizio esistente e popola this.animaliPerLocale[localeId]
  }

  private loadOrdine(id: number): void {
    //this.venditeService.getOrdineById(id).subscribe((ordine) => {
    //this.patchFormOrdine(ordine);
    //});
  }

  private patchFormOrdine(ordine: any): void {
  }

}
