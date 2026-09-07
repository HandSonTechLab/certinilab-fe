import {Injectable} from '@angular/core';
import {BaseService} from './base-service';
import {catchError, Observable, throwError} from 'rxjs';
import {HttpErrorResponse, HttpParams, HttpResponse} from '@angular/common/http';
import {CONSTANTS} from '../shared/constants';
import {Modello4Response, Modello4UpdateRequest} from '../model/modello4.model';

@Injectable({
  providedIn: 'root'
})
export class Modello4Service extends BaseService {

  constructor() {
    super("modello4");
  }

  getModello4(orderId: number): Observable<HttpResponse<Modello4Response>> {
    const params = new HttpParams().set('ordineId', orderId);
    return this.httpClient.get<Modello4Response>(this.url, {params, observe: 'response'})
      .pipe(catchError((error: HttpErrorResponse) => {
          console.log('an error occurred while getting modello4 for ordine #{} -> {}', orderId, error);
          this.errorService.showError(CONSTANTS.get_modello4_request_error_message.concat(': error code ', error.status.toString()))
          return throwError(() => new Error(CONSTANTS.get_modello4_request_error_message));
        })
      );
  }

  updateModello4(orderId: number, body: Modello4UpdateRequest): Observable<HttpResponse<void>> {
    const params = new HttpParams().set('ordineId', orderId);
    return this.httpClient.put<void>(this.url, body, {params, observe: 'response'})
      .pipe(catchError((error: HttpErrorResponse) => {
          console.log('an error occurred while updating modello4 for ordine #{} -> {}', orderId, error);
          this.errorService.showError(CONSTANTS.update_modello4_request_error_message.concat(': error code ', error.status.toString()))
          return throwError(() => new Error(CONSTANTS.update_modello4_request_error_message));
        })
      );
  }
}