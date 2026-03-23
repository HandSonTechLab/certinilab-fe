import {Component} from '@angular/core';
import {InfoOrdine} from '../../model/ordine.model';

@Component({
  selector: 'app-vendite',
  imports: [],
  templateUrl: './vendite.component.html',
  styleUrl: './vendite.component.css'
})
export class VenditeComponent {

  protected orders?: InfoOrdine[] | null;
}
