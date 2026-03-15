import {Injectable} from '@angular/core';
import {BaseService} from './base-service';
import {OrdineCreateRequest} from '../model/ordine.model';
import {catchError, throwError} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
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
          console.log('an error occurred creating Ordine -> {}', error);
          this.errorService.showError(CONSTANTS.create_order_request_error_message.concat(': error code ', error.status.toString()))
          return throwError(() => new Error(CONSTANTS.create_order_request_error_message));
        })
      );
  }
}
