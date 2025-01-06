import { Routes } from '@angular/router';
import {ClientsComponent} from './clients/clients.component';
import {SuppliersComponent} from './suppliers/suppliers.component';
import {ReportComponent} from './report/report.component';
import {SaleComponent} from './sale/sale.component';
import {LogoutComponent} from './logout/logout.component';

export const routes: Routes = [
  {
    path: 'clients', // <your-domain>/path
    component: ClientsComponent,
  },
  {
    path: 'suppliers', // <your-domain>/path
    component: SuppliersComponent,
  },
  {
    path: 'report', // <your-domain>/path
    component: ReportComponent,
  },
  {
    path: 'sale', // <your-domain>/path
    component: SaleComponent,
  },
  { path: 'logout',
    component: LogoutComponent
  },
  {
    path: '',
    redirectTo: '/clients',
    pathMatch: 'full',
  },
];
