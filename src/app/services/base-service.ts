import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ErrorService} from '../shared/error.service';

export class BaseService {
  protected basePath = '/api/v1';
  protected baseUrl = `http://localhost:8080${this.basePath}`;
  protected httpClient = inject(HttpClient);
  protected errorService = inject(ErrorService);

  constructor(resourceUrl: string) {
    this.baseUrl = `${this.baseUrl}/${resourceUrl}`;
  }
}
