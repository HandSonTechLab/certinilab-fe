import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-search-filter',
  imports: [
    FormsModule
  ],
  templateUrl: './search-filter.component.html',
  styleUrl: './search-filter.component.css'
})
export class SearchFilterComponent {
  filters = {
    nome: '',
    cognome: '',
    indirizzo: ''
  };

  onSearch() {
    console.log('Filtri applicati:', this.filters);
    // Qui puoi chiamare un servizio, emettere un evento, fare un filtro locale ecc.
  }
}
