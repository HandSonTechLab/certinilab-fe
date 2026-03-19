import {Injectable} from '@angular/core';
import {BaseService} from './base-service';
import {InfoOrdineResponse, OrdineCreateRequest} from '../model/ordine.model';
import {catchError, Observable, throwError} from 'rxjs';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {CONSTANTS} from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class OrdiniService extends BaseService {

  constructor() {
    super("ordini");
  }

  createOrdine(body: OrdineCreateRequest) {
    return this.httpClient.post<any>(this.url, body, {observe: 'response'})
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred creating ordine -> {}', error);
          this.errorService.showError(CONSTANTS.create_order_request_error_message.concat(': error code ', error.status.toString()))
          return throwError(() => new Error(CONSTANTS.create_order_request_error_message));
        })
      );
  }

  updateOrdine(body: OrdineCreateRequest, orderId: number) {
    return this.httpClient.put<any>(this.url + '/' + orderId, body, {observe: 'response'})
      .pipe(catchError((error: HttpErrorResponse) => {
          console.log('an error occurred while updating ordine #{} -> {}', orderId, error);
          this.errorService.showError(CONSTANTS.update_order_request_error_message.concat(': error code ', error.status.toString()))
          return throwError(() => new Error(CONSTANTS.update_order_request_error_message));
        })
      );
  }

  getOrdineById(orderId: number): Observable<HttpResponse<InfoOrdineResponse>> {
    return this.httpClient.get<any>(this.url + '/' + orderId, {observe: 'response'})
      .pipe(catchError((error: HttpErrorResponse) => {
          console.log('an error occurred while getting ordine #{} -> {}', orderId, error);
          this.errorService.showError(CONSTANTS.get_order_request_error_message.concat(': error code ', error.status.toString()))
          return throwError(() => new Error(CONSTANTS.get_order_request_error_message));
        })
      );
  }
}
