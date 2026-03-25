import {Injectable} from '@angular/core';
import {BaseService} from './base-service';
import {catchError, Observable, throwError} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {CONSTANTS} from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class DocumentiService extends BaseService {

  constructor() {
    super("documenti");
  }

  getDocZipByOrdineId(orderId: number): Observable<Blob> {
    return this.httpClient.get<Blob>(this.url + '/' + orderId)
      .pipe(catchError((error: HttpErrorResponse) => {
          console.log('an error occurred while getting ordine #{} -> {}', orderId, error);
          this.errorService.showError(CONSTANTS.get_order_request_error_message.concat(': error code ', error.status.toString()))
          return throwError(() => new Error(CONSTANTS.get_order_request_error_message));
        })
      );
  }
}
