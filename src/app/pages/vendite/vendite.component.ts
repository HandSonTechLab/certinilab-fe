import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {InfoOrdine} from '../../model/ordine.model';
import {OrdiniService} from '../../services/ordini.service';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-vendite',
  imports: [],
  templateUrl: './vendite.component.html',
  styleUrl: './vendite.component.css'
})
export class VenditeComponent implements OnInit, OnDestroy {

  protected orders?: InfoOrdine[] | null;
  private subscriptions: Subscription[] = [];
  private orderService = inject(OrdiniService);

  constructor(private router: Router) {
  }

  ngOnInit() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el, {
      trigger: 'hover'
    }));
    this.getOrders();
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
    this.subscriptions.forEach(subscription => {
      console.log('I am unsubscribing subscription');
      subscription.unsubscribe()
    });
  }

  private getOrders() {
    const subscription = this.orderService.getOrdini().subscribe({
      next: (response) => {
        this.orders = response.body;
      },
      error: (error) => {
        this.subscriptions.push(subscription);
      },
      complete: () => {
        this.subscriptions.push(subscription);
      }
    })
  }

  newVendita(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const tooltipInstance = bootstrap.Tooltip.getInstance(target);
    tooltipInstance?.hide();  // chiude il tooltip
    this.router.navigate(['/gestione-vendite'], {state: {userId: null, activeMode: 'create'}});
  }
}
