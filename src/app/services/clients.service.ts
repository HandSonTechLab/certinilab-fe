import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {ClientModel} from '../model/client.model';
import {catchError, Observable, throwError} from 'rxjs';
import {ErrorService} from '../shared/error.service';
import {CONSTANTS} from '../shared/constants';
import {SearchData} from '../model/search-data.model';
import {SearchClientsResponse} from '../model/search-clients-response.data';
import {UpdateClientModel} from '../model/update-client.model';

@Injectable({
  // where in the application it can be injected. Root means that it can be used throughout the app.
  providedIn: 'root'
})
export class ClientsService {
  private baseUrl = 'http://localhost:8080/clients';
  private httpClient = inject(HttpClient);
  private errorService = inject(ErrorService);

  constructor() { }

  createClient(client: ClientModel): Observable<HttpResponse<ClientModel>> {
    return this.httpClient.post<ClientModel>(this.baseUrl, client, { observe: 'response' })
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred during create client request -> {}', error.headers.get('X-Error-Message'));
        this.errorService.showError(CONSTANTS.create_client_request_error_message.concat(' \n messaggio di errore: ', error.headers.get('X-Error-Message') || 'N/A'))
        return throwError(() => new Error(CONSTANTS.create_client_request_error_message.concat(' \n messaggio di errore: ', error.headers.get('X-Error-Message') || 'N/A')));
      }))
  }

  searchClients(searchData: SearchData, pageNumber: number, pageSize: number): Observable<HttpResponse<SearchClientsResponse>> {
    return this.httpClient.post<SearchClientsResponse>(this.baseUrl + '/search', searchData, { observe: 'response', params: { pageNumber: pageNumber, pageSize: pageSize } })
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred during search clients request -> {}', error);
        this.errorService.showError(CONSTANTS.search_clients_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.search_clients_request_error_message));
      }))
  }

  findClientById(clientId: number): Observable<HttpResponse<ClientModel>> {
    return this.httpClient.get<ClientModel>(this.baseUrl + '/' + clientId, { observe: 'response' })
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred during search client by id request -> {}', error);
        this.errorService.showError(CONSTANTS.search_client_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.search_client_request_error_message));
      }))
  }

  deleteClientById(clientId: number): Observable<HttpResponse<void>> {
    return this.httpClient.delete<void>(this.baseUrl + '/' + clientId, { observe: 'response' })
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred during delete client by id request -> {}', error);
        this.errorService.showError(CONSTANTS.delete_client_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.delete_client_request_error_message));
      }))
  }

  updateClient(updateClientModel: UpdateClientModel): Observable<HttpResponse<ClientModel>> {
    return this.httpClient.put<ClientModel>(this.baseUrl, updateClientModel, { observe: 'response' })
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred during update client request -> {}', error);
        this.errorService.showError(CONSTANTS.update_client_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.update_client_request_error_message));
      }))
  }

}
