// modelli usati per creare un ordine
export interface OrdineCreateRequest {
  data: string;            // 'YYYY-MM-DD'
  idCliente: number;
  noteOrdine: string | null;
  noteScatole: string | null;
  noteMangime: string | null;
  stato: OrderType;
  spesaScatole: number;
  spesaMangime: number;
  dettagli: DettaglioOrdineRequest[];
}
export interface DettaglioOrdineRequest {
  id: number | null;
  idLotto: number;
  quantita: number | null;
  peso: number | null;
  prezzoUnitario: number;
  note: string | null;
  venditaType: 'AL_KG' | 'PER_UNITA';
}

// modelli usate dalla getById per mostrare i dettagli dell'ordine
export interface InfoOrdineResponse {
  id: number;
  data: string; // 'YYYY-MM-DD'
  idCliente: number;
  nomeCliente: string;
  cognomeCliente: string;
  indirizzoCliente: string;
  noteOrdine: string | null;
  noteScatole: string | null;
  noteMangime: string | null;
  stato: OrderType;
  totaleScatole: number;
  totaleMangime: number;
  totaleAnimali: number;
  totaleOrdine: number;
  dettagli: DettaglioOrdineResponse[];
}

export interface DettaglioOrdineResponse {
  id: number;
  idLotto: number;
  idLocale: number;
  nomeLocale: string;
  idAnimale: number;
  idFornitore: number;
  dataDiNascita: string; // 'YYYY-MM-DD'
  codiceProvenienza: string;
  descrizioneAnimale: string;
  quantita: number;
  peso: number | null;
  prezzoUnitario: number;
  note: string | null;
  venditaType: 'AL_KG' | 'PER_UNITA';
}

// model usato per recupero animali in un locale
export interface AnimaleDisponibile {
  idLotto: number;   // lotto interno
  idAnimale: number;
  dataDiNascita: string; // 'YYYY-MM-DD'
  codiceProvenienza: string;
  fornitoreId: number;
  descrizione: string; // es. "Galline rosse"
  prezzoUnitario?: number;
  quantita: number; // quantità disponibile nel lotto
}

export enum OrderType {
  CONFERMATO = 'CONFERMATO',
  VENDUTO = 'VENDUTO',
}

export interface InfoOrdine {
  id: number;
  data: string; // 'YYYY-MM-DD'
  nomeCompletoCliente: string;
  indirizzoCliente: string;
  stato: OrderType;
  totaleOrdine: number;
}

