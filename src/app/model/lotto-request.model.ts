export interface LottoRequest {
  animaleId: number;
  localeId: number;
  fornitoreId: number;
  dataDiNascita: string; // yyyy-MM-dd
  quantitaIniziale: number;
  quantitaCorrente: number;
  numeroMorti: number;
  prezzoUnitario?: number | null;
}
