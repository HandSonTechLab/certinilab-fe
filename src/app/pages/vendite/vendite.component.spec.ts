import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';

import {VenditeComponent} from './vendite.component';
import {Modello4Response} from '../../model/modello4.model';
import {InfoOrdine, OrderType} from '../../model/ordine.model';
import {ErrorService} from '../../shared/error.service';

describe('VenditeComponent', () => {
  let component: VenditeComponent;
  let fixture: ComponentFixture<VenditeComponent>;
  let httpMock: HttpTestingController;
  let errorService: ErrorService;

  const order: InfoOrdine = {
    id: 42,
    data: '2026-01-15',
    nomeCompletoCliente: 'Mario Rossi',
    indirizzoCliente: 'Via Roma 1',
    stato: OrderType.CONFERMATO,
    totaleOrdine: 100,
  };

  const mockModello4Response: Modello4Response = {
    dataDocumento: '2026-01-15',
    clienteNome: 'Mario',
    clienteCognome: 'Rossi',
    clienteIndirizzo: 'Via Roma 1',
    clienteComune: 'Firenze',
    clienteProvincia: 'FI',
    righe: [
      {id: 7, specie: 'Gallina', contenitori: 'Gabbia', quantita: 10, codiciDiProvenienza: 'IT001'},
    ],
  };

  function matchModello4Request(r: { url: string; params: { get(name: string): string | null } }): boolean {
    return r.url === 'http://localhost:8080/api/v1/modello4' && r.params.get('ordineId') === String(order.id);
  }

  function openAndLoadModal(): void {
    component.openModello4Modal(order);
    httpMock.expectOne(matchModello4Request).flush(mockModello4Response);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenditeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VenditeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    errorService = TestBed.inject(ErrorService);

    fixture.detectChanges();

    // ngOnInit carica l'elenco ordini per la tabella principale
    httpMock.expectOne('http://localhost:8080/api/v1/ordini').flush([]);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('openModello4Modal', () => {
    it('should call GET /modello4 passing ordineId and populate the form from the response', () => {
      component.openModello4Modal(order);

      const req = httpMock.expectOne(matchModello4Request);
      expect(req.request.method).toBe('GET');
      req.flush(mockModello4Response);

      const raw = component.modello4Form.getRawValue();
      expect(raw.dataDocumento).toBe(mockModello4Response.dataDocumento);
      expect(raw.clienteNome).toBe(mockModello4Response.clienteNome);
      expect(raw.clienteCognome).toBe(mockModello4Response.clienteCognome);
      expect(raw.clienteIndirizzo).toBe(mockModello4Response.clienteIndirizzo);
      expect(raw.clienteComune).toBe(mockModello4Response.clienteComune);
      expect(raw.clienteProvincia).toBe(mockModello4Response.clienteProvincia);
      expect(raw.righe).toEqual([
        {id: 7, specie: 'Gallina', contenitori: 'Gabbia', quantita: 10, codiciDiProvenienza: 'IT001'},
      ]);
    });

    it('should keep every field editable while preserving the row id without exposing it for edit', () => {
      openAndLoadModal();

      expect(component.modello4Form.get('dataDocumento')?.enabled).toBeTrue();
      expect(component.modello4Form.get('clienteNome')?.enabled).toBeTrue();
      expect(component.modello4Form.get('clienteCognome')?.enabled).toBeTrue();
      expect(component.modello4Form.get('clienteIndirizzo')?.enabled).toBeTrue();
      expect(component.modello4Form.get('clienteComune')?.enabled).toBeTrue();
      expect(component.modello4Form.get('clienteProvincia')?.enabled).toBeTrue();

      const riga = component.modello4Righe.at(0);
      expect(riga.get('specie')?.enabled).toBeTrue();
      expect(riga.get('contenitori')?.enabled).toBeTrue();
      expect(riga.get('quantita')?.enabled).toBeTrue();
      expect(riga.get('codiciDiProvenienza')?.enabled).toBeTrue();
      expect(riga.get('id')?.value).toBe(7);

      fixture.detectChanges();
      const rowsBody = (fixture.nativeElement as HTMLElement).querySelector('table.table-sm tbody')!;
      const rowInputNames = Array.from(rowsBody.querySelectorAll('input'))
        .map(el => el.getAttribute('formcontrolname'));
      expect(rowInputNames).toEqual(['specie', 'quantita', 'contenitori', 'codiciDiProvenienza']);
      expect(rowInputNames).not.toContain('id');
    });

    it('should surface an error via the ErrorService when the GET request fails', () => {
      component.openModello4Modal(order);

      httpMock.expectOne(matchModello4Request)
        .flush('boom', {status: 500, statusText: 'Server Error'});

      expect(errorService.error()).toContain('Recupero Modello 4 fallito');
    });
  });

  describe('salvaModello4', () => {
    it('should call PUT /modello4 with ordineId and the edited payload, preserving the row id', () => {
      openAndLoadModal();
      component.modello4Righe.at(0).get('specie')?.setValue('Tacchino');

      component.salvaModello4();

      const req = httpMock.expectOne(matchModello4Request);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({
        dataDocumento: '2026-01-15',
        clienteNome: 'Mario',
        clienteCognome: 'Rossi',
        clienteIndirizzo: 'Via Roma 1',
        clienteComune: 'Firenze',
        clienteProvincia: 'FI',
        righe: [
          {id: 7, specie: 'Tacchino', contenitori: 'Gabbia', quantita: 10, codiciDiProvenienza: 'IT001'},
        ],
      });
      req.flush(null);

      // al termine con successo la tabella ordini viene ricaricata
      httpMock.expectOne('http://localhost:8080/api/v1/ordini').flush([]);
    });

    it('should not call the API when the form is invalid', () => {
      openAndLoadModal();
      component.modello4Righe.at(0).get('specie')?.setValue('');

      component.salvaModello4();

      expect(component.modello4Form.invalid).toBeTrue();
      httpMock.expectNone(matchModello4Request);
    });

    it('should surface an error via the ErrorService when the PUT request fails', () => {
      openAndLoadModal();

      component.salvaModello4();

      httpMock.expectOne(matchModello4Request)
        .flush('boom', {status: 400, statusText: 'Bad Request'});

      expect(errorService.error()).toContain('Aggiornamento Modello 4 fallito');
    });
  });
});