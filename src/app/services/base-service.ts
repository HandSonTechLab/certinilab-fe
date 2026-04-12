import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ErrorService} from '../shared/error.service';

export class BaseService {
  protected url = `https://apim-poultryfarm.azure-api.net`;
  protected httpClient = inject(HttpClient);
  protected errorService = inject(ErrorService);

  constructor(resourceUrl: string) {
    this.url = `${this.url}/${resourceUrl}`;
  }
}
