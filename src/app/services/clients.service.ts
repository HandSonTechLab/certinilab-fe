import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {ClientModel} from '../model/client.model';
import {catchError, Observable, throwError} from 'rxjs';
import {ErrorService} from '../shared/error.service';
import {CONSTANTS} from '../shared/constants';

@Injectable({
  // where in the application it can be injected. Root means that it can be used throughout the app.
  providedIn: 'root'
})
export class ClientsService {
  private baseUrl = 'http://localhost:8080/clienti';
  private httpClient = inject(HttpClient);
  private errorService = inject(ErrorService);

  constructor() { }

  createClient(client: ClientModel): Observable<HttpResponse<void>> {
    return this.httpClient.post<void>(this.baseUrl, client, { observe: 'response' })
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred during create client request -> {}', error);
        this.errorService.showError(CONSTANTS.create_client_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.create_client_request_error_message));
      }))
  }

}
