import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {catchError, delay, Observable, of, throwError} from 'rxjs';
import {BaseService} from './base-service';
import {CONSTANTS} from '../shared/constants';
import {ReportVenditeDTO} from '../model/report-vendite.model';
import {USE_MOCK_REPORT_DATA} from './report-mock.config';
import {buildMockReportGiornaliero, buildMockReportMensile} from './report-mock-data';

@Injectable({
  providedIn: 'root' // Rende il service disponibile in tutta l'app (Singleton)
})
export class ReportService extends BaseService {

  private http = inject(HttpClient);

  public constructor() {
    super('report');
  }

  /**
   * GET: Recupera il report vendite giornaliero per una data specifica
   */
  getReportGiornaliero(data: string): Observable<HttpResponse<ReportVenditeDTO>> {
    return this.fetch(
      () => buildMockReportGiornaliero(data),
      () => this.http.get<ReportVenditeDTO>(`${this.url}/giornaliero`, {observe: 'response', params: {data}}).pipe(
        catchError((error: HttpErrorResponse) => {
          console.log('an error occurred when getting report giornaliero -> {}', error);
          this.errorService.showError(CONSTANTS.report_giornaliero_request_error_message.concat(': error code ', error.status.toString()))
          return throwError(() => new Error(CONSTANTS.report_giornaliero_request_error_message));
        })),
    );
  }

  /**
   * GET: Recupera il report vendite mensile per un mese specifico (formato YYYY-MM)
   */
  getReportMensile(mese: string): Observable<HttpResponse<ReportVenditeDTO>> {
    return this.fetch(
      () => buildMockReportMensile(mese),
      () => this.http.get<ReportVenditeDTO>(`${this.url}/mensile`, {observe: 'response', params: {mese}}).pipe(
        catchError((error: HttpErrorResponse) => {
          console.log('an error occurred when getting report mensile -> {}', error);
          this.errorService.showError(CONSTANTS.report_mensile_request_error_message.concat(': error code ', error.status.toString()))
          return throwError(() => new Error(CONSTANTS.report_mensile_request_error_message));
        })),
    );
  }

  // Unico punto in cui si decide tra dati mock e chiamata reale al backend, vedi USE_MOCK_REPORT_DATA.
  private fetch(mockFactory: () => ReportVenditeDTO, live: () => Observable<HttpResponse<ReportVenditeDTO>>): Observable<HttpResponse<ReportVenditeDTO>> {
    if (USE_MOCK_REPORT_DATA) {
      return of(new HttpResponse<ReportVenditeDTO>({body: mockFactory(), status: 200})).pipe(delay(300));
    }
    return live();
  }
}
