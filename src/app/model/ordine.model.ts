export interface DettaglioOrdineRequest {
  idLotto: number;        // nascosto all'utente
  quantita: number;
  peso?: number | null;   // valorizzato solo se vendita "al kg"
  prezzoUnitario: number; // al kg o per unità
  note?: string | null;   // es. "al kg", "per unità", "vivo/macellato"
}

export interface OrdineRequest {
  id?: number;            // presente solo in edit
  data: string;           // 'YYYY-MM-DD'
  idCliente: number;
  stato: string;          // fisso "COMPLETATO"
  noteOrdine?: string | null;

  noteScatole?: string | null;
  noteMangime?: string | null;
  spesaScatole: number;
  spesaMangime: number;

  totale: number;
  dettagli: DettaglioOrdineRequest[];
}

export interface Locale {
  id: number;
  nome: string;
}

export interface AnimaleDisponibile {
  idLotto: number;   // lotto interno
  idAnimale: number;
  dataDiNascita: string; // 'YYYY-MM-DD'
  codiceProvenienza: string;
  descrizione: string; // es. "Galline rosse"
}
