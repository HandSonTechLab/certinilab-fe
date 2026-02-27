import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Lotto} from '../model/lotto.model';
import {LocaleDashboard} from '../model/dashboard.model';
import {BaseService} from './base-service';

@Injectable({
  providedIn: 'root' // Rende il service disponibile in tutta l'app (Singleton)
})
export class MagazzinoService extends BaseService {

  private http = inject(HttpClient);

  public constructor() {
    super('lotti');
  }

  /**
   * GET ALL: Recupera la lista di tutte le allocazioni
   */
  findAll(): Observable<Lotto[]> {
    return this.http.get<Lotto[]>(this.url);
  }

  getDashboardData(): Observable<LocaleDashboard[]> {
    return this.http.get<LocaleDashboard[]>(`${this.url}/dashboard`);
  }

  /**
   * GET BY ID: Recupera una singola allocazione per la modifica
   */
  getById(id: number): Observable<Lotto> {
    return this.http.get<Lotto>(`${this.url}/${id}`);
  }

  /**
   * POST: Crea una nuova allocazione
   */
  create(allocamento: Lotto): Observable<Lotto> {
    return this.http.post<Lotto>(this.url, allocamento);
  }

  /**
   * PUT: Aggiorna un'allocazione esistente
   */
  update(id: number, allocamento: Lotto): Observable<Lotto> {
    return this.http.put<Lotto>(`${this.url}/${id}`, allocamento);
  }

  /**
   * DELETE: Elimina un'allocazione (Opzionale, ma utile averlo)
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
