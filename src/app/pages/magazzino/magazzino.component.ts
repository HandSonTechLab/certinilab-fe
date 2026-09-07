import {Component, inject, OnInit, Signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {LottiService} from '../../services/lotti.service';
import {Router} from '@angular/router';
import {NgClass} from '@angular/common';
import {NotificationModel} from '../../model/notification.model';
// import * as console from 'node:console';
import {HttpEventType, HttpHeaders, HttpResponse} from '@angular/common/http';
import {LocaleDashboard} from '../../model/dashboard.model';


/*

########################
DATI MOCK PER TEST START
#########################

// Definisco l'interfaccia basata sul tuo HTML per chiarezza
export interface Lotto {
  id: number;
  razza: string;
  quantitaCorrente: number;
  numeroMorti: number;
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
  quantitaIniziale: number; // Visualizzato nel badge
  lotti: Lotto[];        // Lista iterata
}

//export const MOCK_DETTAGLIO_LOCALE: DettaglioLocali[] = [];
// I dati mock richiesti (4 Locali)
export const MOCK_DETTAGLIO_LOCALE: DettaglioLocali[] = [
  {
    localeId: 1, // ID fittizio per il track
    locale: 'Locale S1',
    totaleAnimali: 249,
    quantitaIniziale: 300,
    lotti: [
      {id: 101, razza: 'Razza Rossa', quantitaCorrente: 249, numeroMorti: 1}
    ]
  },
  {
    localeId: 2,
    locale: 'Locale S2',
    totaleAnimali: 250,
    quantitaIniziale: 300,
    lotti: [
      {id: 102, razza: 'Razza Rossa', quantitaCorrente: 250, numeroMorti: 0}
    ]
  },
  {
    localeId: 3,
    locale: 'Locale S3',
    totaleAnimali: 250,
    quantitaIniziale: 300,
    lotti: [
      {id: 103, razza: 'Razza Rossa', quantitaCorrente: 250, numeroMorti: 0}
    ]
  },
  {
    localeId: 4,
    locale: 'Locale S4',
    totaleAnimali: 200,
    quantitaIniziale: 300,
    lotti: [
      {id: 104, razza: 'Razza Rossa', quantitaCorrente: 100, numeroMorti: 0},
      {id: 105, razza: 'Razza Gialla', quantitaCorrente: 100, numeroMorti: 0}
    ]
  }
];

export const MOCK_DASHBOARD_DATA: DashboardData = {
  totaleMagazzino: 0,
  totaleVivi: 0,
  totaleMorti: 0,
  dettaglioLocali: MOCK_DETTAGLIO_LOCALE
}

########################
DATI MOCK PER TEST END
#########################
*/

const EMPTY_DASHBOARD: HttpResponse<LocaleDashboard> = {
  body: {
    animaliTotali: 0,
    animaliViviTotali: 0,
    animaliMortiTotali: 0,
    dettagliLocali: []
  },
  headers: new HttpHeaders(),
  status: 200,
  type: HttpEventType.Response,
  ok: true,
  statusText: 'OK',
  url: null,
  clone: function () {
    return this;
  }
};


@Component({
  selector: 'app-magazzino',
  imports: [
    NgClass
  ],
  templateUrl: './magazzino.component.html',
  styleUrl: './magazzino.component.css'
})
export class MagazzinoComponent implements OnInit {
  private service = inject(LottiService);
  private router = inject(Router);
  protected notification?: NotificationModel;
  protected showNotifications: boolean = false;

  /*  dashboard: Signal<DashboardData> = toSignal(of(MOCK_DASHBOARD_DATA), {
      initialValue: {
        totaleMagazzino: 0,
        totaleVivi: 0,
        totaleMorti: 0,
        dettaglioLocali: []
      }
    });*/

  dashboard: Signal<HttpResponse<LocaleDashboard>> = toSignal(this.service.getDashboardData(), {
    initialValue: EMPTY_DASHBOARD
  })!;

  ngOnInit(): void {
    const currNav = this.router.getCurrentNavigation();
    const notification: Notification = currNav?.extras.state as Notification;
    if (notification) {
      this.showNotification(notification);
    }
  }

  goToNuovo() {
    this.router.navigate(['/gestione-lotti'])
  }

  goToModifica(lottoId: number) {
    this.router.navigate(['/gestione-lotti'], {
      queryParams: {id: lottoId}
    });
  }

  // Helper per colori (Semplice logica basata sulla stringa)
  getColorClass(c: string): string {
    if (c.toLowerCase().includes('rosso')) return 'bg-danger text-white';
    if (c.toLowerCase().includes('giallo')) return 'bg-warning text-dark';
    if (c.toLowerCase().includes('bianco')) return 'bg-white text-dark border';
    if (c.toLowerCase().includes('nero')) return 'bg-dark text-white';
    if (c.toLowerCase().includes('grigio')) return 'bg-secondary text-white';
    return 'bg-primary';
  }

  getColorClassBg(razza: string): string {
    if (razza.toLowerCase().includes('Rosso'.toLowerCase())) return 'bg-danger';
    if (razza.toLowerCase().includes('Giallo'.toLowerCase())) return 'bg-warning';
    if (razza.toLowerCase().includes('Grigio'.toLowerCase())) return 'bg-dark';
    if (razza.toLowerCase().includes('Bianco'.toLowerCase())) return 'bg-white';
    if (razza.toLowerCase().includes('Nero'.toLowerCase())) return 'bg-black';
    return 'bg-primary';
  }

  showNotification(notification: NotificationModel) {
    this.showNotifications = true;
    this.notification = notification;
  }
}
