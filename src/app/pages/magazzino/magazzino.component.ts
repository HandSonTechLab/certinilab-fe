import {Component, inject, Signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MagazzinoService} from '../../services/magazzino.service';
import {Router} from '@angular/router';
import {of} from 'rxjs';


// Definisco l'interfaccia basata sul tuo HTML per chiarezza
export interface Lotto {
  id: number;
  razza: string;
  quantita: number;
}

export interface DashboardGroup {
  tipoAnimaleId: number; // Usato nel track del tuo HTML
  locale: string;        // Visualizzato nell'header della card
  totaleAnimali: number; // Visualizzato nel badge
  lotti: Lotto[];        // Lista iterata
}

// I dati mock richiesti (4 Locali)
export const MOCK_DASHBOARD_DATA: DashboardGroup[] = [
  {
    tipoAnimaleId: 1, // ID fittizio per il track
    locale: 'Locale S1',
    totaleAnimali: 250,
    lotti: [
      {id: 101, razza: 'Razza Rossa', quantita: 250}
    ]
  },
  {
    tipoAnimaleId: 2,
    locale: 'Locale S2',
    totaleAnimali: 250,
    lotti: [
      {id: 102, razza: 'Razza Rossa', quantita: 250}
    ]
  },
  {
    tipoAnimaleId: 3,
    locale: 'Locale S3',
    totaleAnimali: 250,
    lotti: [
      {id: 103, razza: 'Razza Rossa', quantita: 250}
    ]
  },
  {
    tipoAnimaleId: 4,
    locale: 'Locale S4',
    totaleAnimali: 200,
    lotti: [
      {id: 104, razza: 'Razza Rossa', quantita: 100},
      {id: 105, razza: 'Razza Gialla', quantita: 100}
    ]
  }
];

@Component({
  selector: 'app-magazzino',
  imports: [],
  templateUrl: './magazzino.component.html',
  styleUrl: './magazzino.component.css'
})
export class MagazzinoComponent {
  private service = inject(MagazzinoService);
  private router = inject(Router);

  // Recupera i dati raggruppati dal backend
  //dashboardList = toSignal(this.service.getDashboardData(), {initialValue: []});
  dashboard: Signal<DashboardGroup[]> = toSignal(of(MOCK_DASHBOARD_DATA), {initialValue: []});

  goToNuovo() {
    // Qui inserisci il router.navigate(['/allocamenti/nuovo'])
    console.log("Naviga a nuovo...");
  }

  goToModifica(id: number, event: Event) {
    event.stopPropagation(); // Evita click indesiderati se la card fosse cliccabile
    this.router.navigate(['/allocamenti/modifica', id]);
  }
}
