import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';

import {ReportService} from './report.service';
import {ReportResponse} from '../model/report-response.model';
import {ReportVenditeDTO} from '../model/report-vendite.model';
import {ErrorService} from '../shared/error.service';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;
  let errorService: ErrorService;

  const mockResponse: ReportResponse = {
    totaleVenditeOrdine: 200,
    totaleVenditeMangime: 150,
    totaleVenditeScatole: 50,
    numeroDiOrdiniEffettuati: 4,
    totaleAnimaliVenduti: 100,
    totaleMorti: 8,
    dettaglioRazzeVendute: {
      Rossi: {quantita: 10, totale: 200},
      Bianchi: {quantita: 90, totale: 1800},
    },
    dettaglioRazzeMorte: {
      Rossi: {numeroMorti: 3, locale: 'Locale A'},
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
    errorService = TestBed.inject(ErrorService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getReportGiornaliero', () => {
    it('should POST a GIORNALIERO ReportRequest with the selected date and map the response to the UI DTO', () => {
      let received: ReportVenditeDTO | null | undefined;

      service.getReportGiornaliero('2026-09-08').subscribe(res => received = res.body);

      const req = httpMock.expectOne('http://localhost:8080/api/v1/report');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({tipo: 'GIORNALIERO', data: '2026-09-08'});
      req.flush(mockResponse);

      expect(received?.numeroOrdini).toBe(4);
      expect(received?.scontrinoMedio).toBe(50);
      expect(received?.capiVenduti).toBe(100);
      expect(received?.dettaglioRazze).toEqual([
        {razza: 'Rossi', capiVenduti: 10, ricavo: 200, percentuale: 10},
        {razza: 'Bianchi', capiVenduti: 90, ricavo: 1800, percentuale: 90},
      ]);
    });

    it('should surface an error and notify the ErrorService when the request fails', () => {
      let receivedError: Error | undefined;

      service.getReportGiornaliero('2026-09-08').subscribe({
        error: (err) => receivedError = err,
      });

      const req = httpMock.expectOne('http://localhost:8080/api/v1/report');
      req.flush('boom', {status: 500, statusText: 'Server Error'});

      expect(receivedError).toBeTruthy();
      expect(errorService.error()).toContain('Recupero report giornaliero fallito');
    });
  });

  describe('getReportMensile', () => {
    it('should POST a MENSILE ReportRequest with mese and anno parsed from the selected month, and map the response', () => {
      let received: ReportVenditeDTO | null | undefined;

      service.getReportMensile('2026-09').subscribe(res => received = res.body);

      const req = httpMock.expectOne('http://localhost:8080/api/v1/report');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({tipo: 'MENSILE', mese: 9, anno: 2026});
      req.flush(mockResponse);

      expect(received?.totaleVendite).toBe(400);
    });

    it('should surface an error and notify the ErrorService when the request fails', () => {
      let receivedError: Error | undefined;

      service.getReportMensile('2026-09').subscribe({
        error: (err) => receivedError = err,
      });

      const req = httpMock.expectOne('http://localhost:8080/api/v1/report');
      req.flush('boom', {status: 500, statusText: 'Server Error'});

      expect(receivedError).toBeTruthy();
      expect(errorService.error()).toContain('Recupero report mensile fallito');
    });
  });
});