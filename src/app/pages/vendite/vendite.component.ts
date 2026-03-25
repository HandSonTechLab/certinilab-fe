import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {InfoOrdine} from '../../model/ordine.model';
import {OrdiniService} from '../../services/ordini.service';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {DocumentiService} from '../../services/documenti.service';

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
  private documentiService = inject(DocumentiService);

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

  downloadDocuments(id: number) {
    this.documentiService.getDocZipByOrdineId(id).subscribe({
      next: (zipBlob) => {
        const blob = new Blob([zipBlob], {type: 'application/zip'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `documenti-ordine-${id}.zip`; // nome file lato client
        a.click();
        window.URL.revokeObjectURL(url);
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
