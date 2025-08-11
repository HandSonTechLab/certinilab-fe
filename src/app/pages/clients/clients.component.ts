import {AfterViewInit, Component, inject, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {SearchFilterComponent} from '../../shared/search-filter/search-filter.component';
import {Router} from '@angular/router';
import {ClientsService} from '../../services/clients.service';
import {Subscription} from 'rxjs';
import {SearchData} from '../../model/search-data.model';
import {ClientDtoModel} from '../../model/client-dto.model';
import {PageInfoModel} from '../../model/page-info.model';
import {SearchValue} from '../../model/search-value.model';
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
export class ClientsComponent implements OnInit , OnDestroy {

  protected notification?: Notification;
  protected showNotifications: boolean = false;
  private clientService = inject(ClientsService);
  private subscriptions: Subscription[] = [];
  protected clients?: ClientDtoModel[] | null;
  protected pageInfo?: PageInfoModel | undefined;
  private defaultPageSize = 10;
  private defaultPageNumber = 0;
  private searchData: SearchData = {};
  clientTheUserWantsToDelete: WritableSignal<ClientDtoModel | null> = signal(null);

  constructor(private router: Router) {
    const currNav = this.router.getCurrentNavigation();
    const notification: Notification = currNav?.extras.state as Notification;
    if (notification) {
      this.showNotification(notification);
    }

  }

  ngOnInit() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));
    this.searchClients({}, this.defaultPageNumber, this.defaultPageSize);
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
    this.subscriptions.forEach(subscription => {
      console.log('I am unsubscribing subscription');
      subscription.unsubscribe()
    });
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
    this.searchClients(this.searchData, this.pageInfo?.pageNumber!! + 1, this.defaultPageSize)
  }

  prevPage() : void {
    this.searchClients(this.searchData, this.pageInfo?.pageNumber!! - 1, this.defaultPageSize)
  }

  viewClient(userId: number) {
    this.router.navigateByUrl('/new-client', { state: { userId: userId} });
  }

  deleteClient() {
    if (this.clientTheUserWantsToDelete() != null) {
      const subscription = this.clientService.deleteClientById(this.clientTheUserWantsToDelete()!!.id).subscribe({
        next: () => {
          this.showNotification({title: 'Eliminazione avvenuta con successo'});
          const myModalEl = document.getElementById('deleteModal')
          const modal = bootstrap.Modal.getInstance(myModalEl) // Returns a Bootstrap modal instance
          modal.hide()
          this.searchClients({}, this.defaultPageNumber, this.defaultPageSize);
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

  showModalEvent(client: ClientDtoModel) {
    this.clientTheUserWantsToDelete?.set(client);
  }

  search(searchData: SearchValue) {
    this.searchData = {nome: searchData.firstInputValue, cognome: searchData.secondInputValue, indirizzo: searchData.thirdInputValue};
    this.searchClients(this.searchData, this.defaultPageNumber, this.defaultPageSize)
  }

  handleResetEvent() {
    this.searchData = {};
    this.searchClients(this.searchData, this.defaultPageNumber, this.defaultPageSize)
  }

  private searchClients(searchData: SearchData, pageNumber: number, pageSize: number) {
    const subscription = this.clientService.searchClients(searchData, pageNumber, pageSize).subscribe({
      next: (response) => {
        this.clients = response.body?.searchClientsDtoList;
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
