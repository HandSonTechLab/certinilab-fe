import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';

import {Modello4Service} from './modello4.service';
import {Modello4Response, Modello4UpdateRequest} from '../model/modello4.model';
import {ErrorService} from '../shared/error.service';

describe('Modello4Service', () => {
  let service: Modello4Service;
  let httpMock: HttpTestingController;
  let errorService: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(Modello4Service);
    httpMock = TestBed.inject(HttpTestingController);
    errorService = TestBed.inject(ErrorService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getModello4', () => {
    it('should call GET /modello4 passing ordineId as request parameter and return the response body', () => {
      const orderId = 42;
      const mockResponse: Modello4Response = {
        dataDocumento: '2026-01-15',
        clienteNome: 'Mario',
        clienteCognome: 'Rossi',
        clienteIndirizzo: 'Via Roma 1',
        clienteComune: 'Firenze',
        clienteProvincia: 'FI',
        righe: [
          {id: 1, specie: 'Gallina', contenitori: 'Gabbia', quantita: 10, codiciDiProvenienza: 'IT001'},
        ],
      };

      let received: Modello4Response | null | undefined;
      service.getModello4(orderId).subscribe(res => {
        received = res.body;
      });

      const req = httpMock.expectOne(
        r => r.url === 'http://localhost:8080/api/v1/modello4' && r.params.get('ordineId') === String(orderId)
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      expect(received).toEqual(mockResponse);
    });

    it('should surface an error and notify the ErrorService when the GET request fails', () => {
      const orderId = 42;
      let receivedError: Error | undefined;

      service.getModello4(orderId).subscribe({
        error: (err) => receivedError = err,
      });

      const req = httpMock.expectOne(
        r => r.url === 'http://localhost:8080/api/v1/modello4' && r.params.get('ordineId') === String(orderId)
      );
      req.flush('boom', {status: 500, statusText: 'Server Error'});

      expect(receivedError).toBeTruthy();
      expect(errorService.error()).toContain('Recupero Modello 4 fallito');
    });
  });

  describe('updateModello4', () => {
    const payload: Modello4UpdateRequest = {
      dataDocumento: '2026-01-15',
      clienteNome: 'Mario',
      clienteCognome: 'Rossi',
      clienteIndirizzo: 'Via Roma 1',
      clienteComune: 'Firenze',
      clienteProvincia: 'FI',
      righe: [
        {id: 1, specie: 'Gallina', contenitori: 'Gabbia', quantita: 10, codiciDiProvenienza: 'IT001'},
      ],
    };

    it('should call PUT /modello4 passing ordineId as request parameter and the update payload as body', () => {
      const orderId = 42;
      let completed = false;

      service.updateModello4(orderId, payload).subscribe({
        complete: () => completed = true,
      });

      const req = httpMock.expectOne(
        r => r.url === 'http://localhost:8080/api/v1/modello4' && r.params.get('ordineId') === String(orderId)
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(null);

      expect(completed).toBeTrue();
    });

    it('should preserve each row id from the GET response unchanged in the PUT request body', () => {
      const orderId = 42;

      service.updateModello4(orderId, payload).subscribe();

      const req = httpMock.expectOne(
        r => r.url === 'http://localhost:8080/api/v1/modello4' && r.params.get('ordineId') === String(orderId)
      );
      expect(req.request.body.righe[0].id).toBe(1);
      req.flush(null);
    });

    it('should surface an error and notify the ErrorService when the PUT request fails', () => {
      const orderId = 42;
      let receivedError: Error | undefined;

      service.updateModello4(orderId, payload).subscribe({
        error: (err) => receivedError = err,
      });

      const req = httpMock.expectOne(
        r => r.url === 'http://localhost:8080/api/v1/modello4' && r.params.get('ordineId') === String(orderId)
      );
      req.flush('boom', {status: 400, statusText: 'Bad Request'});

      expect(receivedError).toBeTruthy();
      expect(errorService.error()).toContain('Aggiornamento Modello 4 fallito');
    });
  });
});