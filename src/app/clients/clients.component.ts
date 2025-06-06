import {AfterViewInit, Component} from '@angular/core';
import {SearchFilterComponent} from '../search-filter/search-filter.component';
import {RouterLink} from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  imports: [
    SearchFilterComponent,
    RouterLink
  ],
  styleUrl: './clients.component.css'
})
export class ClientsComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));
  }
}
