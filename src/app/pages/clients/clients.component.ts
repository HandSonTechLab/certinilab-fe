import {AfterViewInit, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {SearchFilterComponent} from '../search-filter/search-filter.component';
import {Router} from '@angular/router';
import {ClientsService} from '../../services/clients.service';
import {Subscription} from 'rxjs';
import {SearchData} from '../../model/search-data.model';
import {ClientDtoModel} from '../../model/client-dto.model';
import {PageInfoModel} from '../../model/page-info.model';
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
export class ClientsComponent implements OnInit ,  OnDestroy, AfterViewInit {

  protected notification?: Notification;
  protected showNotifications: boolean = false;
  private clientService = inject(ClientsService);
  private subscriptions: Subscription[] = [];
  protected clients?: ClientDtoModel[] | null;
  protected pageInfo?: PageInfoModel | undefined;
  private defaultPageSize = 10;
  private defaultPageNumber = 0;

  constructor(private router: Router) {
    const currNav = this.router.getCurrentNavigation();
    const notification: Notification = currNav?.extras.state as Notification;
    if (notification) {
      this.showNotification(notification);
    }
  }

  ngOnInit() {
    const searchData: SearchData = {};
    const subscription = this.clientService.searchClients(searchData, this.defaultPageNumber, this.defaultPageSize).subscribe({
      next: (response) => {
        this.clients = response.body?.ricercaClientiDtoList;
        this.pageInfo = response.body?.pageInfo;
      },
      error: (error) => {
        this.subscriptions.push(subscription);
      },
      complete: () => {
        this.subscriptions.push(subscription);
      }
    })
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
    this.subscriptions.forEach(subscription => {
      console.log('I am unsubscribing subscription');
      subscription.unsubscribe()
    });
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

  isNextPageTheLastOne(): boolean {
    const nextPage = this.pageInfo?.pageNumber
    if (nextPage != null) {
      return nextPage + 2 == this.pageInfo?.totalPages
    } else {
      return false;
    }
  }

  isCurrentPageTheLastOne(): boolean {
    const nextPage = this.pageInfo?.pageNumber
    if (nextPage != null) {
      return nextPage + 1 == this.pageInfo?.totalPages
    } else {
      return false;
    }
  }

  getPreviousPage(): number {
    return this.pageInfo?.pageNumber!!
  }

  getNextPage(): number {
    return this.pageInfo?.pageNumber!! + 2
  }

  getCurrentPage(): number {
    return this.pageInfo?.pageNumber!! + 1
  }


  isPagesExist() : boolean {
    if (this.pageInfo) {
      return this.pageInfo?.totalPages > 1
    } else {
      return false;
    }
  }

  nextPage() : void {
    const subscription = this.clientService.searchClients({}, this.pageInfo?.pageNumber!! + 1, this.defaultPageSize).subscribe({
      next: (response) => {
        this.clients = response.body?.ricercaClientiDtoList;
        this.pageInfo = response.body?.pageInfo;
      },
      error: (error) => {
        this.subscriptions.push(subscription);
      },
      complete: () => {
        this.subscriptions.push(subscription);
      }
    })
  }

  prevPage() : void {
    const subscription = this.clientService.searchClients({}, this.pageInfo?.pageNumber!! - 1, this.defaultPageSize).subscribe({
      next: (response) => {
        this.clients = response.body?.ricercaClientiDtoList;
        this.pageInfo = response.body?.pageInfo;
      },
      error: (error) => {
        this.subscriptions.push(subscription);
      },
      complete: () => {
        this.subscriptions.push(subscription);
      }
    })
  }

}
