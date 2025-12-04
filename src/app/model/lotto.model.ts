export interface Lotto {
  id?: number;          // Opzionale perché nullo in creazione
  // Campi per il salvataggio (Input)
  tipoAnimaleId: number;
  localeId: number;
  fornitoreId: number;
  dataDiNascita: string; // YYYY-MM-DD
  quantita: number;
  prezzoUnitario: number;
  // Campi UI (Output dal BE per la visualizzazione)
  gruppo?: string;      // Utile per il form se lo gestiamo
  razza?: string;
  locale?: string;
  fornitore?: string;
}
