import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {FormGroup} from '@angular/forms';
import {of} from 'rxjs';

import {RegistrazioneVenditaComponent} from './registrazione-vendita.component';
import {AnimaleDisponibile, DettaglioOrdineResponse, InfoOrdineResponse, OrderType} from '../../model/ordine.model';

describe('RegistrazioneVenditaComponent', () => {
  let component: RegistrazioneVenditaComponent;
  let fixture: ComponentFixture<RegistrazioneVenditaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrazioneVenditaComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {queryParamMap: of(convertToParamMap({}))},
        },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegistrazioneVenditaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should leave mangimi and scatole empty for a new order (not in update mode)', () => {
    expect(component.isEditMode).toBeFalse();
    expect(component.mangimi.length).toBe(0);
    expect(component.scatole.length).toBe(0);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // helper: registra un animale disponibile e lo seleziona sulla prima riga
  function selezionaAnimale(quantitaDisponibile: number): FormGroup {
    const localeId = 1;
    const animale: AnimaleDisponibile = {
      idLotto: 100,
      idAnimale: 200,
      dataDiNascita: '2025-01-01',
      codiceProvenienza: 'X1',
      fornitoreId: 9,
      descrizione: 'Gallina Rossa',
      prezzoUnitario: 2,
      quantita: quantitaDisponibile,
    };
    component.animaliPerLocale[localeId] = [animale];

    const group = component.dettagliAnimali.at(0) as FormGroup;
    group.get('localeId')?.setValue(localeId);
    group.get('animaleId')?.setValue(animale.idAnimale);
    component.onAnimaleChange(0);
    return group;
  }

  it('should store the available quantita on the row when an animal is selected', () => {
    const group = selezionaAnimale(10);
    expect(group.get('quantitaDisponibile')?.value).toBe(10);
  });

  it('should mark quantita invalid with a max error when it exceeds the available quantita', () => {
    const group = selezionaAnimale(10);
    const quantitaCtrl = group.get('quantita');

    quantitaCtrl?.setValue(11);
    component.onValoriRigaChange(0);

    expect(quantitaCtrl?.valid).toBeFalse();
    expect(quantitaCtrl?.errors?.['max']).toBeTruthy();
    expect(quantitaCtrl?.errors?.['max'].max).toBe(10);
  });

  it('should keep quantita valid when it is within the available quantita', () => {
    const group = selezionaAnimale(10);
    const quantitaCtrl = group.get('quantita');

    quantitaCtrl?.setValue(10);
    component.onValoriRigaChange(0);

    expect(quantitaCtrl?.valid).toBeTrue();
  });

  it('should mark quantita invalid with a min error when it is below 1', () => {
    const group = selezionaAnimale(10);
    const quantitaCtrl = group.get('quantita');

    quantitaCtrl?.setValue(0);
    component.onValoriRigaChange(0);

    expect(quantitaCtrl?.valid).toBeFalse();
    expect(quantitaCtrl?.errors?.['min']).toBeTruthy();
  });

  describe('arrotondamento totali a 2 decimali', () => {
    it('should round the animal row total and the animals total to 2 decimals (PER_UNITA)', () => {
      const group = component.dettagliAnimali.at(0) as FormGroup;
      group.get('tipoVendita')?.setValue('PER_UNITA');
      group.get('quantita')?.setValue(3);
      group.get('prezzoUnitario')?.setValue(0.1); // 0.1 * 3 = 0.30000000000000004
      component.onValoriRigaChange(0);

      expect(group.get('totaleRiga')?.value).toBe(0.3);
      expect(component.totaleAnimali()).toBe(0.3);
    });

    it('should round the animal row total to 2 decimals (AL_KG)', () => {
      const group = component.dettagliAnimali.at(0) as FormGroup;
      group.get('tipoVendita')?.setValue('AL_KG');
      group.get('peso')?.setValue(1.111);
      group.get('prezzoUnitario')?.setValue(3); // 1.111 * 3 = 3.333 -> 3.33
      component.onValoriRigaChange(0);

      expect(group.get('totaleRiga')?.value).toBe(3.33);
      expect(component.totaleAnimali()).toBe(3.33);
    });

    it('should round the mangime row total and the mangime total to 2 decimals', () => {
      component.addRigaMangime();
      const group = component.mangimi.at(0) as FormGroup;
      group.get('prezzoAlKg')?.setValue(0.1);
      group.get('kg')?.setValue(3); // 0.1 * 3 = 0.30000000000000004
      component.onValoriMangimeChange(0);

      expect(group.get('totaleRiga')?.value).toBe(0.3);
      expect(component.totaleMangime()).toBe(0.3);
    });

    it('should round the scatola row total and the scatole total to 2 decimals', () => {
      component.addRigaScatola();
      const group = component.scatole.at(0) as FormGroup;
      group.get('prezzoUnitario')?.setValue(0.1);
      group.get('quantita')?.setValue(3); // 0.1 * 3 = 0.30000000000000004
      component.onValoriScatolaChange(0);

      expect(group.get('totaleRiga')?.value).toBe(0.3);
      expect(component.totaleScatole()).toBe(0.3);
    });

    it('should round the overall order total to 2 decimals', () => {
      // animali
      const animale = component.dettagliAnimali.at(0) as FormGroup;
      animale.get('tipoVendita')?.setValue('PER_UNITA');
      animale.get('quantita')?.setValue(3);
      animale.get('prezzoUnitario')?.setValue(0.1);
      component.onValoriRigaChange(0);

      // mangime
      component.addRigaMangime();
      const mangime = component.mangimi.at(0) as FormGroup;
      mangime.get('prezzoAlKg')?.setValue(0.1);
      mangime.get('kg')?.setValue(3);
      component.onValoriMangimeChange(0);

      // scatole
      component.addRigaScatola();
      const scatola = component.scatole.at(0) as FormGroup;
      scatola.get('prezzoUnitario')?.setValue(0.1);
      scatola.get('quantita')?.setValue(3);
      component.onValoriScatolaChange(0);

      // 0.3 + 0.3 + 0.3 = 0.8999999999999999 -> 0.9
      expect(component.totaleOrdine()).toBe(0.9);
    });
  });

  it('should re-evaluate the max validation against the newly selected animal', () => {
    const group = selezionaAnimale(10);
    const quantitaCtrl = group.get('quantita');

    quantitaCtrl?.setValue(8);
    component.onValoriRigaChange(0);
    expect(quantitaCtrl?.valid).toBeTrue();

    // l'utente cambia animale: ora ne sono disponibili solo 5
    const animale: AnimaleDisponibile = {
      idLotto: 101,
      idAnimale: 201,
      dataDiNascita: '2025-02-02',
      codiceProvenienza: 'X2',
      fornitoreId: 9,
      descrizione: 'Gallina Nera',
      prezzoUnitario: 2,
      quantita: 5,
    };
    component.animaliPerLocale[1].push(animale);
    group.get('animaleId')?.setValue(201);
    component.onAnimaleChange(0);

    expect(group.get('quantitaDisponibile')?.value).toBe(5);
    expect(quantitaCtrl?.valid).toBeFalse();
    expect(quantitaCtrl?.errors?.['max'].max).toBe(5);
  });

  describe('sconto ordine', () => {
    /** Imposta una riga animale con un totale noto, cosi' da avere un totale ordine di riferimento. */
    function impostaTotaleOrdine(totale: number): void {
      const animale = component.dettagliAnimali.at(0) as FormGroup;
      animale.get('tipoVendita')?.setValue('PER_UNITA');
      animale.get('quantita')?.setValue(1);
      animale.get('prezzoUnitario')?.setValue(totale);
      component.onValoriRigaChange(0);
    }

    function setSconto(value: number | null): void {
      component.form.get('sconto')?.setValue(value);
      component.onScontoChange();
    }

    it('should render the "Sconto €" input in the order summary', () => {
      const compiled: HTMLElement = fixture.nativeElement;
      const label = Array.from(compiled.querySelectorAll('label, div'))
        .find(el => el.textContent?.trim() === 'Sconto €');
      const input = compiled.querySelector('input[formcontrolname="sconto"]');

      expect(label).toBeTruthy();
      expect(input).toBeTruthy();
    });

    it('should have no discount and an unchanged total by default', () => {
      impostaTotaleOrdine(100);
      expect(component.form.get('sconto')?.value).toBeNull();
      expect(component.totaleOrdine()).toBe(100);
    });

    it('should accept a positive decimal discount and subtract it from the total', () => {
      impostaTotaleOrdine(100);
      setSconto(10.5);

      expect(component.form.get('sconto')?.valid).toBeTrue();
      expect(component.totaleOrdine()).toBe(89.5);
    });

    it('should reject a zero discount', () => {
      impostaTotaleOrdine(100);
      setSconto(0);

      expect(component.form.get('sconto')?.invalid).toBeTrue();
      expect(component.form.get('sconto')?.errors?.['min']).toBeTruthy();
    });

    it('should reject a negative discount', () => {
      impostaTotaleOrdine(100);
      setSconto(-5);

      expect(component.form.get('sconto')?.invalid).toBeTrue();
      expect(component.form.get('sconto')?.errors?.['min']).toBeTruthy();
    });

    it('should reject a discount greater than the overall order total', () => {
      impostaTotaleOrdine(100);
      setSconto(150);

      expect(component.form.get('sconto')?.invalid).toBeTrue();
      expect(component.form.get('sconto')?.errors?.['max']).toBeTruthy();
      expect(component.form.get('sconto')?.errors?.['max'].max).toBe(100);
    });

    it('should accept a discount equal to the overall order total', () => {
      impostaTotaleOrdine(100);
      setSconto(100);

      expect(component.form.get('sconto')?.valid).toBeTrue();
      expect(component.totaleOrdine()).toBe(0);
    });

    it('should not compound the discount across multiple changes', () => {
      impostaTotaleOrdine(100);

      setSconto(10);
      expect(component.totaleOrdine()).toBe(90);

      setSconto(20);
      expect(component.totaleOrdine()).toBe(80);

      setSconto(5);
      expect(component.totaleOrdine()).toBe(95);
    });

    it('should restore the full total when the discount is cleared', () => {
      impostaTotaleOrdine(100);

      setSconto(30);
      expect(component.totaleOrdine()).toBe(70);

      setSconto(null);
      expect(component.form.get('sconto')?.valid).toBeTrue();
      expect(component.totaleOrdine()).toBe(100);
    });

    it('should re-validate the max bound when the order total changes after the discount was set', () => {
      impostaTotaleOrdine(100);
      setSconto(80);
      expect(component.form.get('sconto')?.valid).toBeTrue();

      // il subtotale scende sotto lo sconto gia' impostato
      impostaTotaleOrdine(50);

      expect(component.form.get('sconto')?.invalid).toBeTrue();
      expect(component.form.get('sconto')?.errors?.['max'].max).toBe(50);
    });

    it('should include sconto in buildOrdineCreateRequest when creating an order', () => {
      impostaTotaleOrdine(100);
      setSconto(15);
      component.isEditMode = false;

      const payload = (component as any).buildOrdineCreateRequest(OrderType.VENDUTO);

      expect(payload.sconto).toBe(15);
    });

    it('should include sconto in buildOrdineCreateRequest when updating an order', () => {
      impostaTotaleOrdine(100);
      setSconto(25);
      component.isEditMode = true;
      component.ordineId = 42;

      const payload = (component as any).buildOrdineCreateRequest(OrderType.VENDUTO);

      expect(payload.sconto).toBe(25);
    });

    it('should default sconto to 0 in buildOrdineCreateRequest when no discount is entered', () => {
      impostaTotaleOrdine(100);

      const payload = (component as any).buildOrdineCreateRequest(OrderType.VENDUTO);

      expect(payload.sconto).toBe(0);
    });
  });
});

describe('RegistrazioneVenditaComponent - loadOrdine (modalità aggiornamento)', () => {
  let component: RegistrazioneVenditaComponent;
  let fixture: ComponentFixture<RegistrazioneVenditaComponent>;
  let httpMock: HttpTestingController;

  const dettaglio: DettaglioOrdineResponse = {
    id: 1,
    idLotto: 10,
    idLocale: 5,
    nomeLocale: 'Locale 1',
    idAnimale: 20,
    idFornitore: 30,
    dataDiNascita: '2025-01-01',
    codiceProvenienza: 'ABC123',
    descrizioneAnimale: 'Gallina Rossa',
    quantita: 5,
    peso: 10,
    prezzoUnitario: 2,
    note: null,
    venditaType: 'AL_KG',
  };

  function buildOrdine(overrides: Partial<InfoOrdineResponse>): InfoOrdineResponse {
    return {
      id: 99,
      data: '2026-01-15',
      idCliente: 1,
      nomeCliente: 'Mario',
      cognomeCliente: 'Rossi',
      indirizzoCliente: 'Via Roma 1',
      noteOrdine: null,
      noteScatole: null,
      noteMangime: null,
      stato: OrderType.CONFERMATO,
      totaleScatole: 0,
      totaleMangime: 0,
      totaleAnimali: 20,
      totaleOrdine: 20,
      sconto: null,
      dettagli: [dettaglio],
      ...overrides,
    };
  }

  /** Avvia il componente in modalità aggiornamento e soddisfa tutte le chiamate HTTP innescate da loadOrdine. */
  function caricaOrdine(ordine: InfoOrdineResponse): void {
    fixture.detectChanges(); // ngOnInit -> loadLocali + loadOrdine

    httpMock.expectOne('http://localhost:8080/api/v1/locali').flush([]);

    httpMock.expectOne(`http://localhost:8080/api/v1/ordini/${ordine.id}`).flush(ordine);

    httpMock.expectOne(`http://localhost:8080/api/v1/clienti/${ordine.idCliente}`).flush({
      id: ordine.idCliente,
      nome: 'Mario',
      cognome: 'Rossi',
      cellulare: '123456789',
      indirizzo: 'Via Roma 1',
      provincia: 'FI',
      comune: 'Firenze',
      codiceIdentificativoAsl: 'ASL1',
    });

    ordine.dettagli.forEach(det => {
      httpMock.expectOne(`http://localhost:8080/api/v1/lotti/locale/${det.idLocale}`).flush([]);
    });
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrazioneVenditaComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {queryParamMap: of(convertToParamMap({id: '99'}))},
        },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegistrazioneVenditaComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should parse multiple mangime records from noteMangime and populate every row', () => {
    const ordine = buildOrdine({
      noteMangime: 'Mangime 2 periodo polli: 0.7 €/kg x 6 kg = 4.2 € | Mangime ovaiole: 0.67 €/kg x 7.5 kg = 5.03 € | Mangime 2 periodo polli: 0.7 €/kg x 2 kg = 1.4 €',
    });

    caricaOrdine(ordine);

    expect(component.isEditMode).toBeTrue();
    expect(component.mangimi.length).toBe(3);
    expect(component.mangimi.at(0).getRawValue()).toEqual(jasmine.objectContaining({
      descrizione: 'Mangime 2 periodo polli', prezzoAlKg: 0.7, kg: 6,
    }));
    expect(component.mangimi.at(1).getRawValue()).toEqual(jasmine.objectContaining({
      descrizione: 'Mangime ovaiole', prezzoAlKg: 0.67, kg: 7.5,
    }));
    expect(component.mangimi.at(2).getRawValue()).toEqual(jasmine.objectContaining({
      descrizione: 'Mangime 2 periodo polli', prezzoAlKg: 0.7, kg: 2,
    }));
  });

  it('should parse multiple scatole records from noteScatole and populate every row', () => {
    const ordine = buildOrdine({
      noteScatole: '2: 0.6 € x 10 = 6 € | 1: 0.5 € x 5 = 2.5 €',
    });

    caricaOrdine(ordine);

    expect(component.scatole.length).toBe(2);
    expect(component.scatole.at(0).getRawValue()).toEqual(jasmine.objectContaining({
      descrizione: '2', prezzoUnitario: 0.6, quantita: 10,
    }));
    expect(component.scatole.at(1).getRawValue()).toEqual(jasmine.objectContaining({
      descrizione: '1', prezzoUnitario: 0.5, quantita: 5,
    }));
  });

  it('should leave mangimi and scatole empty when the backend note strings are null or blank', () => {
    const ordine = buildOrdine({noteMangime: null, noteScatole: ''});

    caricaOrdine(ordine);

    expect(component.mangimi.length).toBe(0);
    expect(component.scatole.length).toBe(0);
  });

  it("should pre-fill the sconto field with the order's existing discount and recompute the total", () => {
    const ordine = buildOrdine({sconto: 5});

    caricaOrdine(ordine);

    expect(component.form.get('sconto')?.value).toBe(5);
    expect(component.totaleOrdine()).toBe(15);
  });

  it('should leave the sconto field empty when the loaded order has no discount', () => {
    const ordine = buildOrdine({sconto: null});

    caricaOrdine(ordine);

    expect(component.form.get('sconto')?.value).toBeNull();
    expect(component.totaleOrdine()).toBe(20);
  });

  it('should leave the sconto field empty when the loaded order discount is zero', () => {
    const ordine = buildOrdine({sconto: 0});

    caricaOrdine(ordine);

    expect(component.form.get('sconto')?.value).toBeNull();
    expect(component.totaleOrdine()).toBe(20);
  });
});
