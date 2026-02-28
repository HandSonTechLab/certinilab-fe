import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import {Lotto} from '../model/lotto.model';
import {LocaleDashboard} from '../model/dashboard.model';
import {BaseService} from './base-service';
import {LottoRequest} from '../model/lotto-request.model';
import {CONSTANTS} from '../shared/constants';

@Injectable({
  providedIn: 'root' // Rende il service disponibile in tutta l'app (Singleton)
})
export class LottiService extends BaseService {

  private http = inject(HttpClient);

  public constructor() {
    super('lotti');
  }

  /**
   * GET Dashboard: Recupera i dati per la dashboard dei lotti
   */
  getDashboardData(): Observable<HttpResponse<LocaleDashboard>> {
    return this.http.get<LocaleDashboard>(`${this.url}/dashboard`, {observe: 'response',})
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred when getting dashboard data for Lotti -> {}', error);
        this.errorService.showError(CONSTANTS.suppliers_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.suppliers_request_error_message));
      }));
  }

  /**
   * GET BY ID: Recupera un singolo Lotto per ID
   */
  getById(id: number): Observable<HttpResponse<Lotto>> {
    return this.http.get<Lotto>(`${this.url}/${id}`, {observe: 'response',})
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred when getting Lotto by ID -> {}', error);
        this.errorService.showError(CONSTANTS.lotto_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.lotto_request_error_message));
      }));
  }

  /**
   * POST: Crea un nuovo Lotto
   */
  create(request: LottoRequest): Observable<HttpResponse<any>> {
    return this.http.post<HttpResponse<any>>(this.url, request, {observe: 'response',})
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred when creating Lotto -> {}', error);
        this.errorService.showError(CONSTANTS.create_lotto_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.create_lotto_request_error_message));
      }));
  }

  /**
   * PUT: Aggiorna un lotto esistente
   */
  update(id: number, request: LottoRequest): Observable<HttpResponse<any>> {
    return this.http.put<HttpResponse<any>>(`${this.url}/${id}`, request, {observe: 'response',})
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred when updating Lotto -> {}', error);
        this.errorService.showError(CONSTANTS.update_lotto_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.update_lotto_request_error_message));
      }));
  }
}
