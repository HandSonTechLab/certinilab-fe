export interface RazzaVenditaDettaglio {
  quantita: number;
  totale: number;
}

export interface RazzaMorteDettaglio {
  numeroMorti: number;
  locale: string;
}

export interface ReportResponse {
  totaleVenditeOrdine: number;
  totaleVenditeMangime: number;
  totaleVenditeScatole: number;
  numeroDiOrdiniEffettuati: number;
  totaleAnimaliVenduti: number;
  totaleMorti: number;
  dettaglioRazzeVendute: Record<string, RazzaVenditaDettaglio>;
  dettaglioRazzeMorte: Record<string, RazzaMorteDettaglio>;
}