import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Locale} from '../../model/locale.model';
import {CommonModule} from '@angular/common';
import {
  AnimaleDisponibile,
  DettaglioOrdineRequest,
  DettaglioOrdineResponse,
  InfoOrdineResponse,
  OrderType,
  OrdineCreateRequest,
  OrdineCreateResponse
} from '../../model/ordine.model';
import {ClientsService} from '../../services/clients.service';
import {LocaliService} from '../../services/locali.service';
import {debounceTime, distinctUntilChanged, of, Subscription, switchMap} from 'rxjs';
import {ClientDtoModel} from '../../model/client-dto.model';
import {HttpResponse} from '@angular/common/http';
import {SearchClientsResponse} from '../../model/search-clients-response.data';
import {LottiService} from '../../services/lotti.service';
import {OrdiniService} from '../../services/ordini.service';
import {ClientModel} from '../../model/client.model';

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
  protected readonly defaultPriceForBox: number = 0.50; // prezzo scatole di default, modificabile dall'utente
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
      this.round2(
        this.totaleAnimali() +
        this.totaleMangime() +
        this.totaleScatole()
      )
  );

  /** Arrotonda un valore a esattamente 2 cifre decimali. */
  private round2(value: number): number {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

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
      id: [null], // usato solo in edit
      localeId: [null, Validators.required],
      animaleId: [null, Validators.required],
      dataDiNascita: [null, Validators.required],
      fornitoreId: [null, Validators.required],
      codiceProvenienza: [null, Validators.required],
      idLotto: [null, Validators.required], // valorizzato quando scegli animale
      tipoVendita: ['AL_KG', Validators.required], // AL_KG | PER_UNITA
      quantita: [1, [Validators.required, Validators.min(1)]],
      quantitaDisponibile: [{value: null, disabled: true}], // quantità disponibile nel lotto (solo per validazione/UI)
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
      this.loadAnimaliPerLocale(localeId, null, null);
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
      this.applyQuantitaValidators(group, found.quantita);
    }

  }

  /**
   * Applica i validatori sulla quantità in base alla quantità disponibile nel lotto
   * (campo `quantita` restituito dalla GET /lotti/locale/{localeId}).
   * La quantità richiesta non può superare quella disponibile.
   */
  private applyQuantitaValidators(group: FormGroup, quantitaDisponibile: number | null | undefined): void {
    group.get('quantitaDisponibile')?.setValue(quantitaDisponibile ?? null, {emitEvent: false});

    const validators = [Validators.required, Validators.min(1)];
    if (quantitaDisponibile != null) {
      validators.push(Validators.max(quantitaDisponibile));
    }

    const quantitaCtrl = group.get('quantita');
    quantitaCtrl?.setValidators(validators);
    quantitaCtrl?.updateValueAndValidity();
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

    group.get('totaleRiga')?.setValue(this.round2(totale), {emitEvent: false});
    this.calcolaTotaleAnimali();
  }

  private calcolaTotaleAnimali() {
    const tot = this.dettagliAnimali.controls.reduce((sum, ctrl) => {
      const val = (ctrl as FormGroup).get('totaleRiga')?.value || 0;
      return sum + Number(val);
    }, 0);
    this.totaleAnimali.update(() => this.round2(tot));
  }

  // --- mangimi ---

  // opzioni predefinite per il combo Descrizione mangime, con relativo prezzo/kg di default
  protected readonly MANGIME_OPTIONS: { descrizione: string; prezzoAlKg: number }[] = [
    {descrizione: 'Mangime ovaiole', prezzoAlKg: 0.67},
    {descrizione: 'Mangime 2 periodo polli', prezzoAlKg: 0.70},
  ];

  newRigaMangime(): FormGroup {
    const defaultMangime = this.MANGIME_OPTIONS[0];
    return this.fb.group({
      descrizione: [defaultMangime.descrizione],
      prezzoAlKg: [defaultMangime.prezzoAlKg, [Validators.required, Validators.min(0.01)]],
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

  onMangimeDescrizioneChange(index: number): void {
    const group = this.mangimi.at(index) as FormGroup;
    const descrizione = group.get('descrizione')?.value;
    const selected = this.MANGIME_OPTIONS.find(opt => opt.descrizione === descrizione);
    if (selected) {
      group.get('prezzoAlKg')?.setValue(selected.prezzoAlKg);
    }
    this.onValoriMangimeChange(index);
  }

  onValoriMangimeChange(index: number): void {
    const group = this.mangimi.at(index) as FormGroup;
    const prezzo = +group.get('prezzoAlKg')?.value || 0;
    const kg = +group.get('kg')?.value || 0;
    const totale = prezzo * kg;
    group.get('totaleRiga')?.setValue(this.round2(totale), {emitEvent: false});
    this.calcolaTotaleMangime();
  }

  private calcolaTotaleMangime() {
    const tot = this.mangimi.controls.reduce((sum, ctrl) => {
      const val = (ctrl as FormGroup).get('totaleRiga')?.value || 0;
      return sum + Number(val);
    }, 0);
    this.totaleMangime.update(() => this.round2(tot));
  }

  newRigaScatola(): FormGroup {
    return this.fb.group({
      descrizione: [''],
      prezzoUnitario: [this.defaultPriceForBox, [Validators.required, Validators.min(0.01)]],
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
    group.get('totaleRiga')?.setValue(this.round2(totale), {emitEvent: false});
    this.calcolaTotaleScatole();
  }

  private calcolaTotaleScatole() {
    const tot = this.scatole.controls.reduce((sum, ctrl) => {
      const val = (ctrl as FormGroup).get('totaleRiga')?.value || 0;
      return sum + Number(val);
    }, 0);
    this.totaleScatole.update(() => this.round2(tot));
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
    const isCreate = !(this.isEditMode && this.ordineId);

    const $call = this.isEditMode && this.ordineId
      ? this.ordineService.updateOrdine(payload, this.ordineId)
      : this.ordineService.createOrdine(payload);

    $call.subscribe({
        next: (res) => {
          if (isCreate && payload.orderType === 'al_dettaglio') {
            const body = res.body as OrdineCreateResponse;
            if (body?.modello04) {
              this.openPdfInNewTab(body.modello04);
            }
            if (body?.schedaVaccinazione) {
              this.openPdfInNewTab(body.schedaVaccinazione);
            }
          }
        },
        error: (err) => {
          // gestione errore (alert ecc.)
        },
      complete: () => {
        this.router.navigate(['/']);
        }
      });
  }

  /** Decodifica un PDF base64 e lo apre in una nuova scheda del browser. */
  private openPdfInNewTab(base64Pdf: string): void {
    const byteCharacters = atob(base64Pdf);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([new Uint8Array(byteNumbers)], {type: 'application/pdf'});
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => window.URL.revokeObjectURL(url), 60000);
  }

  private buildOrdineCreateRequest(orderType: OrderType): OrdineCreateRequest {
    const raw = this.form.getRawValue();

    // calcoli totali da FormArray
    const spesaMangime = this.round2(this.mangimi.controls.reduce((sum, ctrl) =>
      sum + Number((ctrl as FormGroup).get('totaleRiga')?.value || 0), 0));

    const spesaScatole = this.round2(this.scatole.controls.reduce((sum, ctrl) =>
      sum + Number((ctrl as FormGroup).get('totaleRiga')?.value || 0), 0));

    const noteMangime = this.buildNoteMangime();
    const noteScatole = this.buildNoteScatole();

    const dettagli: DettaglioOrdineRequest[] = this.dettagliAnimali.controls.map(ctrl => {
      const g = ctrl as FormGroup;
      return {
        id: g.get('id')?.value ?? null,
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
      orderType: 'al_dettaglio',
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

  /**
   * Popola le righe mangime a partire dalla stringa "descrizione: prezzo €/kg x kg kg = totale €"
   * restituita dal backend, con più record separati da "|" (formato speculare a buildNoteMangime).
   */
  private parseNoteMangime(noteMangime: string | null | undefined): void {
    this.mangimi.clear();
    this.splitNoteRecords(noteMangime).forEach(record => {
      const match = record.match(/^(.+?):\s*([\d.,]+)\s*€\/kg\s*x\s*([\d.,]+)\s*kg\s*=/);
      if (!match) {
        return;
      }
      const fg = this.newRigaMangime();
      fg.patchValue({
        descrizione: match[1].trim(),
        prezzoAlKg: this.parseDecimal(match[2]),
        kg: this.parseDecimal(match[3]),
      });
      this.mangimi.push(fg);
      this.onValoriMangimeChange(this.mangimi.length - 1);
    });
  }

  /**
   * Popola le righe scatole a partire dalla stringa "descrizione: prezzo € x quantita = totale €"
   * restituita dal backend, con più record separati da "|" (formato speculare a buildNoteScatole).
   */
  private parseNoteScatole(noteScatole: string | null | undefined): void {
    this.scatole.clear();
    this.splitNoteRecords(noteScatole).forEach(record => {
      const match = record.match(/^(.+?):\s*([\d.,]+)\s*€\s*x\s*([\d.,]+)\s*=/);
      if (!match) {
        return;
      }
      const fg = this.newRigaScatola();
      fg.patchValue({
        descrizione: match[1].trim(),
        prezzoUnitario: this.parseDecimal(match[2]),
        quantita: this.parseDecimal(match[3]),
      });
      this.scatole.push(fg);
      this.onValoriScatolaChange(this.scatole.length - 1);
    });
  }

  private splitNoteRecords(note: string | null | undefined): string[] {
    if (!note) {
      return [];
    }
    return note.split('|')
      .map(record => record.trim())
      .filter(record => record.length > 0);
  }

  private parseDecimal(value: string): number {
    return Number(value.trim().replace(',', '.'));
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

  private loadAnimaliPerLocale(localeId: number, det?: DettaglioOrdineResponse | null, fg?: FormGroup | null): void {
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
            quantita: element.quantita,
          }
          animaliDisponibili.push(animale);
        })
        this.animaliPerLocale[localeId] = animaliDisponibili;
        if (det && fg) {
          this.setAnimaleFromDettaglio(localeId, det, fg);
        }
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
    this.ordineService.getOrdineById(id).subscribe({
      next: (response) => {
        // testata
        const ordine = response.body as InfoOrdineResponse;
        this.form.patchValue({
          data: ordine.data,
          idCliente: ordine.idCliente,
          noteOrdine: ordine.noteOrdine || '',
          // le noteScatole/noteMangime del BE le mostriamo
          noteScatole: ordine.noteScatole || '',
          noteMangime: ordine.noteMangime || ''
        });

        this.clientService.findClientById(ordine.idCliente).subscribe({
          next: (res) => {
            const c = res.body as ClientModel;
            this.clienti = [{
              id: c.id!, nome: c.nome, cognome: c.cognome, indirizzo: c.indirizzo,
              provincia: c.provincia, comune: c.comune, codiceIdentificativoAsl: c.codiceIdentificativoAsl
            }];
          },
          error: (err) => {
            // gestione errore (es. cliente non trovato, ma non dovrebbe succedere)
          }
        })

        // totali
        this.totaleAnimali.update(() => this.round2(ordine.totaleAnimali));
        this.totaleMangime.update(() => this.round2(ordine.totaleMangime));
        this.totaleScatole.update(() => this.round2(ordine.totaleScatole));
        this.form.get('spesaMangime')?.setValue(this.round2(ordine.totaleMangime));
        this.form.get('spesaScatole')?.setValue(this.round2(ordine.totaleScatole));

        // righe animali
        this.dettagliAnimali.clear();
        ordine.dettagli.forEach(det => {
          const fg = this.newRigaAnimale();

          fg.patchValue({
            localeId: det.idLocale,
            dataDiNascita: det.dataDiNascita,
            fornitoreId: det.idFornitore,
            codiceProvenienza: det.codiceProvenienza,
            tipoVendita: det.venditaType,
            quantita: det.quantita,
            peso: det.peso,
            prezzoUnitario: det.prezzoUnitario,
            note: det.note || ''
          });

          // forza validatori peso in base al tipo
          if (det.venditaType === 'AL_KG') {
            fg.get('peso')?.setValidators([Validators.required, Validators.min(0.01)]);
          } else {
            fg.get('peso')?.clearValidators();
          }
          fg.get('peso')?.updateValueAndValidity({emitEvent: false});

          // calcolo totale riga
          const totaleRiga = this.round2(
            det.venditaType === 'AL_KG'
              ? (det.peso || 0) * det.prezzoUnitario
              : det.quantita * det.prezzoUnitario
          );
          fg.get('totaleRiga')?.setValue(totaleRiga, {emitEvent: false});
          fg.get('id')?.setValue(det.id);
          this.dettagliAnimali.push(fg);
          // carico elenco animali per quel locale e poi setto animaleId/idLotto
          this.loadAnimaliPerLocale(det.idLocale, det, fg);
        });

        // righe mangime e scatole: il backend le restituisce come testo libero "record1 | record2 | ..."
        this.parseNoteMangime(ordine.noteMangime);
        this.parseNoteScatole(ordine.noteScatole);

        // ricalcola totali complessivi nel caso serva
        this.calcolaTotaleAnimali();
        this.calcolaTotaleMangime();
        this.calcolaTotaleScatole();
      },
      error: err => {
        // gestione errore (es. redirect)
      }
    });
  }

  private setAnimaleFromDettaglio(
    localeId: number,
    det: DettaglioOrdineResponse,
    fg: FormGroup
  ): void {
    const lista = this.animaliPerLocale[localeId] || [];
    const found = lista.find(a => a.idLotto === det.idLotto && a.idAnimale === det.idAnimale);
    if (found) {
      fg.patchValue({
        animaleId: found.idAnimale,
        idLotto: found.idLotto,
      }, {emitEvent: false});
      this.applyQuantitaValidators(fg, found.quantita);
    }
  }
}
