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

  generateModello4Pdf(orderId: number): Observable<Blob> {
    return this.httpClient.get(this.url + '/modello4/' + orderId, {responseType: 'blob'})
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred while generating modello4 pdf for ordine #{} -> {}', orderId, error);
        this.errorService.showError(CONSTANTS.generate_modello4_pdf_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.generate_modello4_pdf_request_error_message));
        })
      );
  }
}
