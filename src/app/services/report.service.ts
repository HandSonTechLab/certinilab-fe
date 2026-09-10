import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {catchError, delay, map, Observable, of, throwError} from 'rxjs';
import {BaseService} from './base-service';
import {CONSTANTS} from '../shared/constants';
import {ReportVenditeDTO} from '../model/report-vendite.model';
import {ReportRequest, ReportType} from '../model/report-request.model';
import {ReportResponse} from '../model/report-response.model';
import {USE_MOCK_REPORT_DATA} from './report-mock.config';
import {buildMockReportGiornaliero, buildMockReportMensile} from './report-mock-data';
import {mapReportResponseToDTO} from './report-mapper';

@Injectable({
  providedIn: 'root' // Rende il service disponibile in tutta l'app (Singleton)
})
export class ReportService extends BaseService {

  private http = inject(HttpClient);

  public constructor() {
    super('report');
  }

  /**
   * POST: Genera il report vendite giornaliero per una data specifica
   */
  getReportGiornaliero(data: string): Observable<HttpResponse<ReportVenditeDTO>> {
    const request: ReportRequest = {tipo: ReportType.GIORNALIERO, data};
    return this.fetch(
      () => buildMockReportGiornaliero(data),
      () => this.generaReport(request, CONSTANTS.report_giornaliero_request_error_message),
    );
  }

  /**
   * POST: Genera il report vendite mensile per un mese specifico (formato YYYY-MM)
   */
  getReportMensile(mese: string): Observable<HttpResponse<ReportVenditeDTO>> {
    const [anno, meseNumero] = mese.split('-').map(Number);
    const request: ReportRequest = {tipo: ReportType.MENSILE, mese: meseNumero, anno};
    return this.fetch(
      () => buildMockReportMensile(mese),
      () => this.generaReport(request, CONSTANTS.report_mensile_request_error_message),
    );
  }

  private generaReport(request: ReportRequest, errorMessage: string): Observable<HttpResponse<ReportVenditeDTO>> {
    return this.http.post<ReportResponse>(this.url, request, {observe: 'response'}).pipe(
      map(response => new HttpResponse<ReportVenditeDTO>({
        body: response.body ? mapReportResponseToDTO(response.body) : null,
        status: response.status,
      })),
      catchError((error: HttpErrorResponse) => {
        console.log('an error occurred when generating report -> {}', error);
        this.errorService.showError(errorMessage.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(errorMessage));
      }),
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
