import {DettaglioLotto} from './dettaglio-lotto.model';

export interface DettaglioLocali {
  localeId: number;
  locale: string;
  totaleAnimaliCorrenti: number;
  quantitaIniziale: number;
  lotti: DettaglioLotto[];
}
