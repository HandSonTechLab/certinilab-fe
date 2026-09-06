// modelli usati per la modifica del Modello 4 associato ad un ordine
export interface Modello4DettaglioRequest {
  id: number; // id del dettaglio ordine di tipo modello4
  specie: string;
  quantita: number;
  contenitori: string | null;
  codiceProvenienza: string;
}

export interface Modello4UpdateRequest {
  idOrdine: number;
  data: string; // 'YYYY-MM-DD'
  nomeCognomeCliente: string;
  indirizzoCliente: string;
  comuneCliente: string;
  provinciaCliente: string;
  dettagli: Modello4DettaglioRequest[];
}
