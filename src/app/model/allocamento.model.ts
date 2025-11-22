export interface Allocamento {
  id?: number;          // Opzionale perché nullo in creazione
  // Campi per il salvataggio (Input)
  animaleId: number;
  localeId: number;
  fornitoreId: number;
  dataDiNascita: string; // YYYY-MM-DD
  quantita: number;
  prezzo: number;
  // Campi UI (Output dal BE per la visualizzazione)
  gruppo?: string;      // Utile per il form se lo gestiamo
  nomeRazza?: string;
  nomeLocale?: string;
  nomeFornitore?: string;
}
