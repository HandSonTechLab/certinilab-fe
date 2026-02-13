import {Routes} from '@angular/router';
import {ClientsComponent} from './pages/clients/clients.component';
import {SuppliersComponent} from './pages/suppliers/suppliers.component';
import {ReportComponent} from './pages/report/report.component';
import {SaleComponent} from './pages/sale/sale.component';
import {CreateClientComponent} from './pages/create-client/create-client.component';
import {CreateSupplierComponent} from './pages/create-supplier/create-supplier.component';
import {MagazzinoComponent} from './pages/magazzino/magazzino.component';
import {MsalGuard} from '@azure/msal-angular';

export const routes: Routes = [
  {
    path: '',
    component: MagazzinoComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'clients',
    component: ClientsComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'new-client',
    component: CreateClientComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'suppliers',
    component: SuppliersComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'new-suppliers',
    component: CreateSupplierComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'report',
    component: ReportComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'sale',
    component: SaleComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'magazzino',
    component: MagazzinoComponent,
    canActivate: [MsalGuard]
  },
  {
    path: '**',
    redirectTo: '',
  },
];
