import { Routes } from '@angular/router';
import {ClientsGroupComponent} from './pages/clients/clients-group/clients-group.component';
import {SuppliersGroupComponent} from './pages/suppliers/suppliers-group/suppliers-group.component';
import {ReportComponent} from './pages/reports/report/report.component';
import {SaleComponent} from './pages/counter-sale/sale/sale.component';
import {LogoutComponent} from './menu/logout/logout.component';
import {CreateClientComponent} from './pages/clients/create-client/create-client.component';

export const routes: Routes = [
  {
    path: 'clients-group', // <your-domain>/path
    component: ClientsGroupComponent,
  },
  {
    path: 'clients-group/new-client',
    component: CreateClientComponent
  },
  {
    path: 'suppliers-group', // <your-domain>/path
    component: SuppliersGroupComponent,
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
    redirectTo: '/clients-group',
    pathMatch: 'full',
  },
];
