// modelli usati per la modifica del Modello 4 associato ad un ordine
export interface Modello4DettaglioRequest {
  id: number;
  specie: string;
  quantita: number;
  contenitori: string | null;
  codiceProvenienza: string;
}

export interface Modello4UpdateRequest {
  idOrdine: number;
  data: string; // 'YYYY-MM-DD'
  nomeCliente: string;
  cognomeCliente: string;
  indirizzoCliente: string;
  comuneCliente: string;
  provinciaCliente: string;
  dettagli: Modello4DettaglioRequest[];
}
