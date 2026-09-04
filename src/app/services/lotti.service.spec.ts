import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';

import {LottiService} from './lotti.service';
import {LottiLocaleDTO} from '../model/lotto.model';

describe('LottiService', () => {
  let service: LottiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(LottiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should consume the new "quantita" field from GET /lotti/locale/{localeId}', () => {
    const localeId = 7;
    const mockResponse: LottiLocaleDTO[] = [
      {
        idLotto: 1,
        idAnimale: 10,
        razza: 'Gallina',
        colore: 'Rossa',
        codiceProvenienza: 'ABC123',
        fornitoreId: 5,
        dataDiNascita: '2025-01-01',
        prezzoUnitario: 3.5,
        quantita: 42,
      },
    ];

    let received: LottiLocaleDTO[] | undefined;
    service.getLottiByLocaleId(localeId).subscribe(res => {
      received = res.body ?? undefined;
    });

    const req = httpMock.expectOne(`http://localhost:8080/api/v1/lotti/locale/${localeId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(received).toBeDefined();
    expect(received!.length).toBe(1);
    expect(received![0].quantita).toBe(42);
  });
});