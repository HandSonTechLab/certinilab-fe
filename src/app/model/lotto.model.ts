export interface Lotto {
  id?: number;          // Opzionale perché nullo in creazione
  // Campi per il salvataggio (Input)
  animaleId: number;
  localeId: number;
  fornitoreId: number;
  dataDiNascita: string; // YYYY-MM-DD
  quantitaIniziale: number;
  quantitaCorrente: number;
  numeroMorti: number;
  prezzoUnitario: number;
}

export interface LottiLocaleDTO {
  idLotto: number;
  idAnimale: number;
  razza: string;
  colore: string;
  codiceProvenienza: string;
  fornitoreId: number;
  dataDiNascita: string;
  prezzoUnitario: number;
  quantita: number; // quantità di animali attualmente disponibili nel lotto
}
