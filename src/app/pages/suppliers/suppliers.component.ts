import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {SupplierService} from '../../services/supplier.service';
import {PageInfoModel} from '../../model/page-info.model';
import {Router} from '@angular/router';
import {SupplierModel} from '../../model/supplier.model';
import {NotificationModel} from '../../model/notification.model';

declare var bootstrap: any;

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.css'
})
export class SuppliersComponent implements OnInit, OnDestroy {
  loading = false;
  protected notification?: NotificationModel;
  protected showNotifications: boolean = false;
  private supplierService = inject(SupplierService);
  private subscriptions: Subscription[] = [];
  protected suppliers?: SupplierModel[] | null;
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
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el, {
      trigger: 'hover'
    }));
    this.getSuppliers(this.defaultPageNumber, this.defaultPageSize);
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
    this.subscriptions.forEach(subscription => {
      console.log('I am unsubscribing subscription');
      subscription.unsubscribe()
    });
  }

  showNotification(notification: NotificationModel) {
    this.showNotifications = true;
    this.notification = notification;
  }

  openNewSupplierPage() {
    this.router.navigate(['/nuovi-fornitori', {state: {supplierId: null, activeMode: 'create'}}]);
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


  isPagesExist(): boolean {
    if (this.pageInfo) {
      return this.pageInfo?.totalPages > 1
    } else {
      return false;
    }
  }

  nextPage(): void {
    this.getSuppliers(this.pageInfo?.pageNumber!! + 1, this.defaultPageSize)
  }

  prevPage(): void {
    this.getSuppliers(this.pageInfo?.pageNumber!! - 1, this.defaultPageSize)
  }

  viewSupplier(event: MouseEvent, activeMode: string, id?: number) {
    const target = event.currentTarget as HTMLElement;
    const tooltipInstance = bootstrap.Tooltip.getInstance(target);
    tooltipInstance?.hide();  // chiude il tooltip
    this.router.navigateByUrl('/nuovi-fornitori', {
      state: {
        id: id,
        activeMode: activeMode
      }
    });
  }

  private getSuppliers(pageNumber: number, pageSize: number) {
    this.loading = true;
    const subscription = this.supplierService.findSuppliersPaginated(pageNumber, pageSize).subscribe({
      next: (response) => {
        this.suppliers = response.body?.supplierEntities;
        this.pageInfo = response.body?.pageInfo;
        this.loading = false;
      },
      error: (error) => {
        this.subscriptions.push(subscription);
        this.loading = false;
      },
      complete: () => {
        this.subscriptions.push(subscription);
      }
    })
  }
}
