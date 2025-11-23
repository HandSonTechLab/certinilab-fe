import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Allocamento} from '../model/allocamento.model';
import {LocaleDashboard} from '../model/dashboard.model';

@Injectable({
  providedIn: 'root' // Rende il service disponibile in tutta l'app (Singleton)
})
export class MagazzinoService {

  private http = inject(HttpClient);

  // Idealmente questo URL dovrebbe stare in environment.ts,
  // ma per ora lo hardcodiamo per semplicità
  private apiUrl = 'http://localhost:8080/api/allocamenti';

  /**
   * GET ALL: Recupera la lista di tutte le allocazioni
   */
  findAll(): Observable<Allocamento[]> {
    return this.http.get<Allocamento[]>(this.apiUrl);
  }

  getDashboardData(): Observable<LocaleDashboard[]> {
    return this.http.get<LocaleDashboard[]>(`${this.apiUrl}/dashboard`);
  }

  /**
   * GET BY ID: Recupera una singola allocazione per la modifica
   */
  getById(id: number): Observable<Allocamento> {
    return this.http.get<Allocamento>(`${this.apiUrl}/${id}`);
  }

  /**
   * POST: Crea una nuova allocazione
   */
  create(allocamento: Allocamento): Observable<Allocamento> {
    return this.http.post<Allocamento>(this.apiUrl, allocamento);
  }

  /**
   * PUT: Aggiorna un'allocazione esistente
   */
  update(id: number, allocamento: Allocamento): Observable<Allocamento> {
    return this.http.put<Allocamento>(`${this.apiUrl}/${id}`, allocamento);
  }

  /**
   * DELETE: Elimina un'allocazione (Opzionale, ma utile averlo)
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
