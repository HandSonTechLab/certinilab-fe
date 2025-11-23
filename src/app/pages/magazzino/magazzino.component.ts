import {Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MagazzinoService} from '../../services/magazzino.service';
import {Router} from '@angular/router';

// (Dentro il file del component o separato)
export interface LocaleGroup {
  nomeLocale: string;
  totaleCapi: number; // Somma totale per locale (utile!)
  animali: {
    razza: string;
    quantita: number;
    prezzo: number; // Opzionale
  }[];
}

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
  dashboardList = toSignal(this.service.getDashboardData(), {initialValue: []});

  goToNuovo() {
    // Qui inserisci il router.navigate(['/allocamenti/nuovo'])
    console.log("Naviga a nuovo...");
  }

  goToModifica(id: number, event: Event) {
    event.stopPropagation(); // Evita click indesiderati se la card fosse cliccabile
    this.router.navigate(['/allocamenti/modifica', id]);
  }
}
