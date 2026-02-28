import {DettaglioLocali} from './dettaglio-locali.model';

export interface LocaleDashboard {
  animaliTotali: number;
  animaliViviTotali: number;
  animaliMortiTotali: number;
  dettagliLocali: DettaglioLocali[];
}
