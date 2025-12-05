import {Component, inject, Signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MagazzinoService} from '../../services/magazzino.service';
import {Router} from '@angular/router';
import {of} from 'rxjs';
import {NgClass} from '@angular/common';


// Definisco l'interfaccia basata sul tuo HTML per chiarezza
export interface Lotto {
  id: number;
  razza: string;
  quantita: number;
  morti: number;
}

export interface DashboardData {
  totaleMagazzino: number;
  totaleVivi: number;
  totaleMorti: number;
  dettaglioLocali: DettaglioLocali[];
}

export interface DettaglioLocali {
  localeId: number; // Usato nel track del tuo HTML
  locale: string;        // Visualizzato nell'header della card
  totaleAnimali: number; // Visualizzato nel badge
  capienzaMax: number; // Visualizzato nel badge
  lotti: Lotto[];        // Lista iterata
}


// I dati mock richiesti (4 Locali)
export const MOCK_DETTAGLIO_LOCALE: DettaglioLocali[] = [
  {
    localeId: 1, // ID fittizio per il track
    locale: 'Locale S1',
    totaleAnimali: 249,
    capienzaMax: 300,
    lotti: [
      {id: 101, razza: 'Razza Rossa', quantita: 249, morti: 1}
    ]
  },
  {
    localeId: 2,
    locale: 'Locale S2',
    totaleAnimali: 250,
    capienzaMax: 300,
    lotti: [
      {id: 102, razza: 'Razza Rossa', quantita: 250, morti: 0}
    ]
  },
  {
    localeId: 3,
    locale: 'Locale S3',
    totaleAnimali: 250,
    capienzaMax: 300,
    lotti: [
      {id: 103, razza: 'Razza Rossa', quantita: 250, morti: 0}
    ]
  },
  {
    localeId: 4,
    locale: 'Locale S4',
    totaleAnimali: 200,
    capienzaMax: 300,
    lotti: [
      {id: 104, razza: 'Razza Rossa', quantita: 100, morti: 0},
      {id: 105, razza: 'Razza Gialla', quantita: 100, morti: 0}
    ]
  }
];

export const MOCK_DASHBOARD_DATA: DashboardData = {
  totaleMagazzino: 950,
  totaleVivi: 900,
  totaleMorti: 50,
  dettaglioLocali: MOCK_DETTAGLIO_LOCALE
}


@Component({
  selector: 'app-magazzino',
  imports: [
    NgClass
  ],
  templateUrl: './magazzino.component.html',
  styleUrl: './magazzino.component.css'
})
export class MagazzinoComponent {
  private service = inject(MagazzinoService);
  private router = inject(Router);

  // Recupera i dati raggruppati dal backend
  //dashboardList = toSignal(this.service.getDashboardData(), {initialValue: []});
  dashboard: Signal<DashboardData> = toSignal(of(MOCK_DASHBOARD_DATA), {
    initialValue: {
      totaleMagazzino: 0,
      totaleVivi: 0,
      totaleMorti: 0,
      dettaglioLocali: []
    }
  });

  goToNuovo() {
    // Qui inserisci il router.navigate(['/allocamenti/nuovo'])
    console.log("Naviga a nuovo...");
  }

  goToModifica(id: number, event: Event) {
    event.stopPropagation(); // Evita click indesiderati se la card fosse cliccabile
    this.router.navigate(['/allocamenti/modifica', id]);
  }

  // Helper per colori (Semplice logica basata sulla stringa)
  getColorClass(razza: string): string {
    if (razza.toLowerCase().includes('rossa')) return 'bg-danger';
    if (razza.toLowerCase().includes('gialla')) return 'bg-warning text-dark';
    return 'bg-primary';
  }

  getColorClassBg(razza: string): string {
    if (razza.toLowerCase().includes('rossa')) return 'bg-danger';
    if (razza.toLowerCase().includes('gialla')) return 'bg-warning';
    return 'bg-primary';
  }
}
