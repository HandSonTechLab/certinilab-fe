export interface DettaglioOrdineRequest {
  id: number | null;
  idLotto: number;
  quantita: number | null;
  peso: number | null;
  prezzoUnitario: number;
  note: string | null;
  venditaType: 'AL_KG' | 'PER_UNITA';
}

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

export interface Locale {
  id: number;
  nome: string;
}

export interface AnimaleDisponibile {
  idLotto: number;   // lotto interno
  idAnimale: number;
  dataDiNascita: string; // 'YYYY-MM-DD'
  codiceProvenienza: string;
  fornitoreId: number;
  descrizione: string; // es. "Galline rosse"
  prezzoUnitario?: number;
}

export enum OrderType {
  CONFERMATO,
  VENDUTO
}

