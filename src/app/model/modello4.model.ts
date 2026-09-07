// modelli usati per la consultazione e la modifica del Modello 4 associato ad un ordine

export interface Modello4RigaResponse {
  id: number;
  specie: string;
  contenitori: string | null;
  quantita: number;
  codiciDiProvenienza: string;
}

export interface Modello4Response {
  dataDocumento: string; // 'YYYY-MM-DD'
  clienteNome: string;
  clienteCognome: string;
  clienteIndirizzo: string;
  clienteComune: string;
  clienteProvincia: string;
  righe: Modello4RigaResponse[];
}

export interface Modello4RigaRequest {
  id: number;
  specie: string;
  contenitori: string | null;
  quantita: number;
  codiciDiProvenienza: string;
}

export interface Modello4UpdateRequest {
  dataDocumento: string; // 'YYYY-MM-DD'
  clienteNome: string;
  clienteCognome: string;
  clienteIndirizzo: string;
  clienteComune: string;
  clienteProvincia: string;
  righe: Modello4RigaRequest[];
}