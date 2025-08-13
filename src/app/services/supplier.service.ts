import {Injectable} from '@angular/core';
import {BaseService} from './base-service';
import {catchError, Observable, throwError} from 'rxjs';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {CONSTANTS} from '../shared/constants';
import {SupplierResponse} from '../model/supplier-response.data';
import {SupplierModel} from '../model/supplier.model';

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

  findSupplierById(codiceProvenienza: string): Observable<HttpResponse<SupplierModel>> {
    return this.httpClient.get<SupplierModel>(this.baseUrl + '/' + codiceProvenienza, {observe: 'response'})
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred during search supplier by id request -> {}', error);
        this.errorService.showError(CONSTANTS.find_supplier_byid_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.find_supplier_byid_request_error_message));
      }))
  }
}
