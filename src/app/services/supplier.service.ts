import {Injectable} from '@angular/core';
import {BaseService} from './base-service';
import {catchError, Observable, throwError} from 'rxjs';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {CONSTANTS} from '../shared/constants';
import {SupplierResponse} from '../model/supplier-response.data';
import {SupplierModel} from '../model/supplier.model';
import {Fornitore} from '../model/fornitore.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService extends BaseService {

  constructor() {
    super("fornitori");
  }

  createSupplier(supplierModel: SupplierModel): Observable<HttpResponse<SupplierModel>> {
    return this.httpClient.post<SupplierModel>(this.url, supplierModel, {observe: 'response'})
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred when creating supplier request -> {}', error.headers.get('X-Error-Message'));
        this.errorService.showError(CONSTANTS.create_supplier_request_error_message.concat(' \n messaggio di errore: ', error.headers.get('X-Error-Message') || 'N/A'))
        return throwError(() => new Error(CONSTANTS.create_supplier_request_error_message.concat(' \n messaggio di errore: ', error.headers.get('X-Error-Message') || 'N/A')));
      }))
  }

  updateSupplier(supplierModel: SupplierModel): Observable<HttpResponse<SupplierModel>> {
    return this.httpClient.put<SupplierModel>(this.url, supplierModel, {observe: 'response'})
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred when updating supplier request -> {}', error);
        this.errorService.showError(CONSTANTS.update_supplier_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.update_supplier_request_error_message));
      }))
  }

  findSuppliersPaginated(pageNumber: number, pageSize: number): Observable<HttpResponse<SupplierResponse>> {
    return this.httpClient.get<SupplierResponse>(this.url + '/paginated', {
      observe: 'response',
      params: {pageNumber: pageNumber, pageSize: pageSize}
    })
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred when finding suppliers -> {}', error);
        this.errorService.showError(CONSTANTS.suppliers_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.suppliers_request_error_message));
      }))
  }

  recuperaFornitoriPerDropdown(): Observable<HttpResponse<Fornitore[]>> {
    return this.httpClient.get<Fornitore[]>(this.url + '/dropdown', {observe: 'response',})
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred when finding suppliers for dropdown -> {}', error);
        this.errorService.showError(CONSTANTS.suppliers_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.suppliers_request_error_message));
      }))
  }

  findSupplierById(id: number): Observable<HttpResponse<SupplierModel>> {
    return this.httpClient.get<SupplierModel>(this.url + '/' + id, {observe: 'response'})
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred during search supplier by id request -> {}', error);
        this.errorService.showError(CONSTANTS.find_supplier_byid_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.find_supplier_byid_request_error_message));
      }))
  }
}
