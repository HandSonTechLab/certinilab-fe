export interface DettaglioLotto {
  id: number;
  razza: string;
  colore: string;
  codiceProvenienza: string;
  dataDiNascita: string; // yyyy-MM-dd
  quantitaIniziale: number;
  quantitaCorrente: number;
  numeroMorti: number;
}
