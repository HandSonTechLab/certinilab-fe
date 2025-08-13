import {Injectable} from '@angular/core';
import {BaseService} from './base-service';
import {catchError, Observable, throwError} from 'rxjs';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {CONSTANTS} from '../shared/constants';
import {SupplierResponse} from '../model/supplier-response.data';

@Injectable({
  providedIn: 'root'
})
export class SupplierService extends BaseService {

  constructor() {
    super("suppliers");
  }

  findSuppliers(pageNumber: number, pageSize: number): Observable<HttpResponse<SupplierResponse>> {
    return this.httpClient.get<SupplierResponse>(this.baseUrl, {
      observe: 'response',
      params: {pageNumber: pageNumber, pageSize: pageSize}
    })
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred when finding suppliers -> {}', error);
        this.errorService.showError(CONSTANTS.suppliers_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.suppliers_request_error_message));
      }))
  }
}
