export interface ClientModel {
  id?: number | null;
  nome: string;
  cognome: string;
  cellulare: string;
  dataNascita?: string;
  codiceFiscale?: string;
  indirizzo: string;
  provincia: string;
  comune: string;
  codiceIdentificativoAsl: string;
  email?: string | null;
}


// opzionali, se ti servono per popolare dropdown
export interface ClientLiveSearchModel {
  id: number;
  nome: string;
  cognome: string;
  indirizzo: string;
  provincia: string;
  comune: string;
  codiceAsl: string;
}
