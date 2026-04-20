import {Injectable} from '@angular/core';
import {BaseService} from './base-service';
import {catchError, Observable, throwError} from 'rxjs';
import {Animale} from '../model/animale.model';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {CONSTANTS} from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class AnimaliService extends BaseService {

  constructor() {
    super("lotto", "animali");
  }

  getAnimali(): Observable<HttpResponse<Animale[]>> {
    return this.httpClient.get<Animale[]>(this.url, {observe: 'response'})
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log('an error occurred searching animals -> {}', error);
        this.errorService.showError(CONSTANTS.search_animals_request_error_message.concat(': error code ', error.status.toString()))
        return throwError(() => new Error(CONSTANTS.search_animals_request_error_message));
      }));
  }
}
