import {mapReportResponseToDTO} from './report-mapper';
import {ReportResponse} from '../model/report-response.model';

describe('mapReportResponseToDTO', () => {
  const baseResponse: ReportResponse = {
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
      Bianchi: {numeroMorti: 5, locale: 'Locale B'},
    },
  };

  it('should map totals, order count and animal/death counts from the API response', () => {
    const dto = mapReportResponseToDTO(baseResponse);

    expect(dto.totaleVendite).toBe(400);
    expect(dto.numeroOrdini).toBe(4);
    expect(dto.capiVenduti).toBe(100);
    expect(dto.capiMorti).toBe(8);
  });

  it('should map ricavoPerCategoria from totaleVenditeOrdine/Mangime/Scatole', () => {
    const dto = mapReportResponseToDTO(baseResponse);

    expect(dto.ricavoPerCategoria).toEqual([
      {categoria: 'ANIMALI', ricavo: 200, percentuale: 50},
      {categoria: 'MANGIME', ricavo: 150, percentuale: 38},
      {categoria: 'SCATOLE', ricavo: 50, percentuale: 13},
    ]);
  });

  it('should calculate scontrino medio as totaleVenditeOrdine / numeroDiOrdiniEffettuati', () => {
    const dto = mapReportResponseToDTO(baseResponse);

    expect(dto.scontrinoMedio).toBe(50); // 200 / 4
  });

  it('should return a scontrino medio of 0 when numeroDiOrdiniEffettuati is 0, avoiding a division by zero', () => {
    const response: ReportResponse = {...baseResponse, numeroDiOrdiniEffettuati: 0};

    const dto = mapReportResponseToDTO(response);

    expect(dto.scontrinoMedio).toBe(0);
    expect(dto.numeroOrdini).toBe(0);
  });

  it('should calculate the sales percentage per razza as quantita / totaleAnimaliVenduti * 100', () => {
    const dto = mapReportResponseToDTO(baseResponse);

    expect(dto.dettaglioRazze).toEqual([
      {razza: 'Rossi', capiVenduti: 10, ricavo: 200, percentuale: 10},
      {razza: 'Bianchi', capiVenduti: 90, ricavo: 1800, percentuale: 90},
    ]);
  });

  it('should return a percentage of 0 per razza when totaleAnimaliVenduti is 0, avoiding a division by zero', () => {
    const response: ReportResponse = {
      ...baseResponse,
      totaleAnimaliVenduti: 0,
      dettaglioRazzeVendute: {Rossi: {quantita: 0, totale: 0}},
    };

    const dto = mapReportResponseToDTO(response);

    expect(dto.dettaglioRazze).toEqual([
      {razza: 'Rossi', capiVenduti: 0, ricavo: 0, percentuale: 0},
    ]);
  });

  it('should map dettaglioRazzeMorte to razza/capiMorti pairs', () => {
    const dto = mapReportResponseToDTO(baseResponse);

    expect(dto.dettaglioRazzeMorti).toEqual([
      {razza: 'Rossi', capiMorti: 3},
      {razza: 'Bianchi', capiMorti: 5},
    ]);
  });
});