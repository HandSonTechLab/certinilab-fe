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

  createSupplier(supplierModel: SupplierModel): Observable<HttpResponse<SupplierModel>> {
    return this.httpClient.post<SupplierModel>(this.baseUrl, supplierModel, {observe: 'response'})
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred when creating supplier request -> {}', error.headers.get('X-Error-Message'));
        this.errorService.showError(CONSTANTS.create_supplier_request_error_message.concat(' \n messaggio di errore: ', error.headers.get('X-Error-Message') || 'N/A'))
        return throwError(() => new Error(CONSTANTS.create_supplier_request_error_message.concat(' \n messaggio di errore: ', error.headers.get('X-Error-Message') || 'N/A')));
      }))
  }

  updateSupplier(supplierModel: SupplierModel): Observable<HttpResponse<SupplierModel>> {
    return this.httpClient.put<SupplierModel>(this.baseUrl, supplierModel, {observe: 'response'})
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred when updating supplier request -> {}', error);
        this.errorService.showError(CONSTANTS.update_supplier_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.update_supplier_request_error_message));
      }))
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

  findSupplierById(id: number): Observable<HttpResponse<SupplierModel>> {
    return this.httpClient.get<SupplierModel>(this.baseUrl + '/' + id, {observe: 'response'})
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred during search supplier by id request -> {}', error);
        this.errorService.showError(CONSTANTS.find_supplier_byid_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.find_supplier_byid_request_error_message));
      }))
  }
}
