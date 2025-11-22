import {Component, computed, inject} from '@angular/core';
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

  // Trasformiamo l'Observable in Signal automaticamente
  // InitialValue è [] per evitare errori prima del caricamento
  allocamentiList = toSignal(this.service.findAll(), {initialValue: []});

  // Computed: ricalcola automaticamente il raggruppamento quando i dati cambiano
  allocamentiRaggruppati = computed(() => {
    const rawData = this.allocamentiList();
    if (!rawData) return [];

    // Logica di raggruppamento
    const mappa = new Map<string, LocaleGroup>();

    rawData.forEach(dto => {
      const key = dto.nomeLocale || 'Locale Sconosciuto';

      if (!mappa.has(key)) {
        mappa.set(key, {
          nomeLocale: key,
          totaleCapi: 0,
          animali: []
        });
      }

      const entry = mappa.get(key)!;
      entry.animali.push({
        razza: dto.nomeRazza || 'Razza sconosciuta', // Usa il campo mappato nel DTO
        quantita: dto.quantita,
        prezzo: dto.prezzo
      });
      entry.totaleCapi += dto.quantita;
    });

    // Convertiamo la mappa in array per l'HTML
    return Array.from(mappa.values());
  });

  // Helper per capire se sta caricando (opzionale, grezzo)
  isLoading = computed(() => this.allocamentiList().length === 0); // Logica semplificata

  goToNuovo() {
    // Qui inserisci il router.navigate(['/allocamenti/nuovo'])
    console.log("Naviga a nuovo...");
  }

  goToModifica(id: number, event: Event) {
    event.stopPropagation(); // Evita click indesiderati se la card fosse cliccabile
    this.router.navigate(['/allocamenti/modifica', id]);
  }
}
