import {DettaglioRazza, MortalitaRazza, ReportVenditeDTO, RicavoCategoria} from '../model/report-vendite.model';

const PREZZO_UNITARIO_ANIMALE = 20;

// Tassi di mortalità indicativi sui capi movimentati per razza nel periodo.
const TASSO_MORTALITA_GIALLA = 0.15;
const TASSO_MORTALITA_ROSSA = 0.12;

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Deterministic 0.80-1.20 multiplier so the same date/mese always yields the same numbers.
function variance(seed: string, salt: string): number {
  return 0.8 + (hashSeed(seed + salt) % 41) / 100;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function percentualiDi(ricavi: number[]): number[] {
  const totale = ricavi.reduce((sum, r) => sum + r, 0);
  return ricavi.map(r => totale > 0 ? Math.round((r / totale) * 100) : 0);
}

// scala: 1 per un report giornaliero, ~22 (giorni lavorativi) per un report mensile.
function buildReport(seed: string, scala: number): ReportVenditeDTO {
  const capiGialla = Math.round(scala * 7 * variance(seed, 'gialla'));
  const capiRossa = Math.round(scala * 5 * variance(seed, 'rossa'));

  const ricavoGialla = round2(capiGialla * PREZZO_UNITARIO_ANIMALE);
  const ricavoRossa = round2(capiRossa * PREZZO_UNITARIO_ANIMALE);
  const [percRazzaGialla, percRazzaRossa] = percentualiDi([ricavoGialla, ricavoRossa]);

  const dettaglioRazze: DettaglioRazza[] = [
    {razza: 'GIALLA', capiVenduti: capiGialla, ricavo: ricavoGialla, percentuale: percRazzaGialla},
    {razza: 'ROSSA', capiVenduti: capiRossa, ricavo: ricavoRossa, percentuale: percRazzaRossa},
  ];

  const capiMortiGialla = Math.round(capiGialla * TASSO_MORTALITA_GIALLA * variance(seed, 'morti-gialla'));
  const capiMortiRossa = Math.round(capiRossa * TASSO_MORTALITA_ROSSA * variance(seed, 'morti-rossa'));

  const dettaglioRazzeMorti: MortalitaRazza[] = [
    {razza: 'GIALLA', capiMorti: capiMortiGialla},
    {razza: 'ROSSA', capiMorti: capiMortiRossa},
  ];

  const ricavoAnimali = round2(ricavoGialla + ricavoRossa);
  const ricavoMangime = round2(scala * 150 * variance(seed, 'mangime'));
  const ricavoScatole = round2(scala * 120 * variance(seed, 'scatole'));
  const [percAnimali, percMangime, percScatole] = percentualiDi([ricavoAnimali, ricavoMangime, ricavoScatole]);

  const ricavoPerCategoria: RicavoCategoria[] = [
    {categoria: 'ANIMALI', ricavo: ricavoAnimali, percentuale: percAnimali},
    {categoria: 'MANGIME', ricavo: ricavoMangime, percentuale: percMangime},
    {categoria: 'SCATOLE', ricavo: ricavoScatole, percentuale: percScatole},
  ];

  const totaleVendite = round2(ricavoAnimali + ricavoMangime + ricavoScatole);
  const numeroOrdini = Math.max(1, Math.round(scala * 4 * variance(seed, 'ordini')));

  return {
    totaleVendite,
    numeroOrdini,
    capiVenduti: capiGialla + capiRossa,
    capiMorti: capiMortiGialla + capiMortiRossa,
    scontrinoMedio: round2(totaleVendite / numeroOrdini),
    ricavoPerCategoria,
    dettaglioRazze,
    dettaglioRazzeMorti,
  };
}

export function buildMockReportGiornaliero(data: string): ReportVenditeDTO {
  return buildReport(data, 1);
}

export function buildMockReportMensile(mese: string): ReportVenditeDTO {
  return buildReport(mese, 22);
}
