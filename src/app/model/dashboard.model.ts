import {Lotto} from './lotto.model';

export interface LocaleDashboard {
  localeId: number;
  nomeLocale: string;
  totale: number;
  allocazioni: Lotto[];
}
