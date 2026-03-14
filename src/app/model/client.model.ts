export interface ClientModel {
  nome: String;
  cognome: String;
  cellulare: String;
  dataNascita?: Date;
  codiceFiscale?: String;
  indirizzo: String;
  provincia: String;
  comune: String;
  codiceIdentificativoAsl: String;
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
