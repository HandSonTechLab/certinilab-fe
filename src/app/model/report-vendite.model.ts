export type CategoriaVendita = 'ANIMALI' | 'MANGIME' | 'SCATOLE';

export interface RicavoCategoria {
  categoria: CategoriaVendita;
  ricavo: number;
  percentuale: number;
}

export interface DettaglioRazza {
  razza: string;
  capiVenduti: number;
  ricavo: number;
  percentuale: number;
}

export interface MortalitaRazza {
  razza: string;
  capiMorti: number;
}

export interface ReportVenditeDTO {
  totaleVendite: number;
  numeroOrdini: number;
  capiVenduti: number;
  capiMorti: number;
  scontrinoMedio: number;
  ricavoPerCategoria: RicavoCategoria[];
  dettaglioRazze: DettaglioRazza[];
  dettaglioRazzeMorti: MortalitaRazza[];
}
