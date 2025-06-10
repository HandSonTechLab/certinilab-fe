import {AfterViewInit, Component} from '@angular/core';
import {SearchFilterComponent} from '../search-filter/search-filter.component';
import {Router} from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  imports: [
    SearchFilterComponent,
  ],
  styleUrl: './clients.component.css'
})
export class ClientsComponent implements AfterViewInit {

  constructor(private router: Router) { }

  ngAfterViewInit(): void {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));
  }

  openNewClientPage() {
    this.router.navigate(['/new-client']);
  }
}
