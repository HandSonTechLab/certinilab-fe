import {HttpClient, HttpResponse} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Lotto} from '../model/lotto.model';
import {LocaleDashboard} from '../model/dashboard.model';
import {BaseService} from './base-service';
import {LottoRequest} from '../model/lotto-request.model';

@Injectable({
  providedIn: 'root' // Rende il service disponibile in tutta l'app (Singleton)
})
export class LottiService extends BaseService {

  private http = inject(HttpClient);

  public constructor() {
    super('lotti');
  }

  /**
   * GET Dashboard: Recupera i dati per la dashboard dei lotti
   */
  getDashboardData(): Observable<LocaleDashboard[]> {
    return this.http.get<LocaleDashboard[]>(`${this.url}/dashboard`);
  }

  /**
   * GET BY ID: Recupera un singolo Lotto per ID
   */
  getById(id: number): Observable<Lotto> {
    return this.http.get<Lotto>(`${this.url}/${id}`);
  }

  /**
   * POST: Crea un nuovo Lotto
   */
  create(request: LottoRequest): Observable<HttpResponse<any>> {
    return this.http.post<HttpResponse<any>>(this.url, request);
  }

  /**
   * PUT: Aggiorna un lotto esistente
   */
  update(id: number, request: LottoRequest): Observable<HttpResponse<any>> {
    return this.http.put<HttpResponse<any>>(`${this.url}/${id}`, request);
  }
}
