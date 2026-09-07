import {Injectable} from '@angular/core';
import {BaseService} from './base-service';
import {catchError, Observable, throwError} from 'rxjs';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {CONSTANTS} from '../shared/constants';
import {Modello4UpdateRequest} from '../model/modello4.model';

@Injectable({
  providedIn: 'root'
})
export class Modello4Service extends BaseService {

  constructor() {
    super("ordini");
  }

  // TODO: endpoint placeholder, il backend non lo espone ancora - allineare il path quando sarà disponibile
  updateModello4(orderId: number, body: Modello4UpdateRequest): Observable<HttpResponse<void>> {
    return this.httpClient.put<void>(this.url + '/' + orderId + '/modello4', body, {observe: 'response'})
      .pipe(catchError((error: HttpErrorResponse) => {
          console.log('an error occurred while updating modello4 for ordine #{} -> {}', orderId, error);
          this.errorService.showError(CONSTANTS.update_modello4_request_error_message.concat(': error code ', error.status.toString()))
          return throwError(() => new Error(CONSTANTS.update_modello4_request_error_message));
        })
      );
  }

  // TODO: endpoint placeholder, il backend non lo espone ancora - allineare il path quando sarà disponibile
  generateModello4Pdf(orderId: number): Observable<Blob> {
    return this.httpClient.get(this.url + '/' + orderId + '/modello4/pdf', {responseType: 'blob'})
      .pipe(catchError((error: HttpErrorResponse) => {
          console.log('an error occurred while generating modello4 pdf for ordine #{} -> {}', orderId, error);
          this.errorService.showError(CONSTANTS.generate_modello4_pdf_request_error_message.concat(': error code ', error.status.toString()))
          return throwError(() => new Error(CONSTANTS.generate_modello4_pdf_request_error_message));
        })
      );
  }
}
