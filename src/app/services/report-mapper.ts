import {DettaglioRazza, MortalitaRazza, ReportVenditeDTO, RicavoCategoria} from '../model/report-vendite.model';
import {ReportResponse} from '../model/report-response.model';

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function percentuale(parte: number, totale: number): number {
  return totale > 0 ? Math.round((parte / totale) * 100) : 0;
}

// Mappa la ReportResponse del backend nel ReportVenditeDTO usato dalla UI, calcolando
// scontrino medio e percentuali (per categoria e per razza) lato FE.
export function mapReportResponseToDTO(response: ReportResponse): ReportVenditeDTO {
  const ricavoAnimali = Number(response.totaleVenditeOrdine ?? 0);
  const ricavoMangime = Number(response.totaleVenditeMangime ?? 0);
  const ricavoScatole = Number(response.totaleVenditeScatole ?? 0);
  const totaleVendite = round2(ricavoAnimali + ricavoMangime + ricavoScatole);

  const numeroOrdini = Number(response.numeroDiOrdiniEffettuati ?? 0);
  const capiVenduti = response.totaleAnimaliVenduti ?? 0;
  const capiMorti = response.totaleMorti ?? 0;

  const ricavoPerCategoria: RicavoCategoria[] = [
    {categoria: 'ANIMALI', ricavo: round2(ricavoAnimali), percentuale: percentuale(ricavoAnimali, totaleVendite)},
    {categoria: 'MANGIME', ricavo: round2(ricavoMangime), percentuale: percentuale(ricavoMangime, totaleVendite)},
    {categoria: 'SCATOLE', ricavo: round2(ricavoScatole), percentuale: percentuale(ricavoScatole, totaleVendite)},
  ];

  const dettaglioRazze: DettaglioRazza[] = Object.entries(response.dettaglioRazzeVendute ?? {})
    .map(([razza, dettaglio]) => ({
      razza,
      capiVenduti: dettaglio.quantita,
      ricavo: Number(dettaglio.totale),
      percentuale: percentuale(dettaglio.quantita, capiVenduti),
    }));

  const dettaglioRazzeMorti: MortalitaRazza[] = Object.entries(response.dettaglioRazzeMorte ?? {})
    .map(([razza, dettaglio]) => ({
      razza,
      capiMorti: dettaglio.numeroMorti,
    }));

  return {
    totaleVendite,
    numeroOrdini,
    capiVenduti,
    capiMorti,
    scontrinoMedio: numeroOrdini > 0 ? round2(ricavoAnimali / numeroOrdini) : 0,
    ricavoPerCategoria,
    dettaglioRazze,
    dettaglioRazzeMorti,
  };
}