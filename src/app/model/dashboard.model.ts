import {Allocamento} from './allocamento.model';

export interface LocaleDashboard {
  localeId: number;
  nomeLocale: string;
  totale: number;
  allocazioni: Allocamento[];
}
