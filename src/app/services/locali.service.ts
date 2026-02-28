import {Injectable} from '@angular/core';
import {BaseService} from './base-service';
import {Locale} from '../model/locale.model';
import {catchError, Observable, throwError} from 'rxjs';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {CONSTANTS} from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class LocaliService extends BaseService {

  constructor() {
    super("locali");
  }

  getLocali(): Observable<HttpResponse<Locale[]>> {
    return this.httpClient.get<Locale[]>(this.url, {observe: 'response'})
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred during search client by id request -> {}', error);
        this.errorService.showError(CONSTANTS.search_client_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.search_client_request_error_message));
      }));
  }
}
