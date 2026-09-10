export enum ReportType {
  GIORNALIERO = 'GIORNALIERO',
  MENSILE = 'MENSILE',
}

export interface ReportRequest {
  tipo: ReportType;
  data?: string; // 'YYYY-MM-DD', valorizzato solo per tipo GIORNALIERO
  mese?: number; // 1-12, valorizzato solo per tipo MENSILE
  anno?: number; // valorizzato solo per tipo MENSILE
}