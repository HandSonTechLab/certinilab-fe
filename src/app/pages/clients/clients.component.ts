import {AfterViewInit, Component} from '@angular/core';
import {SearchFilterComponent} from '../search-filter/search-filter.component';
import {Router} from '@angular/router';
declare var bootstrap: any;

export interface Notification {
  title: string;
}

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  imports: [
    SearchFilterComponent,
  ],
  styleUrl: './clients.component.css'
})
export class ClientsComponent implements AfterViewInit {

  protected notification?: Notification;
  protected showNotifications: boolean = false;

  constructor(private router: Router) {
    const currNav = this.router.getCurrentNavigation();
    const notification: Notification = currNav?.extras.state as Notification;
    if (notification) {
      this.showNotification(notification);
    }
  }

  ngAfterViewInit(): void {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));
  }

  openNewClientPage() {
    this.router.navigate(['/new-client']);
  }

  showNotification(notification: Notification) {
    this.showNotifications = true;
    this.notification = notification;
  }
}
