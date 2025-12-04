import {Routes} from '@angular/router';
import {ClientsComponent} from './pages/clients/clients.component';
import {SuppliersComponent} from './pages/suppliers/suppliers.component';
import {ReportComponent} from './pages/report/report.component';
import {SaleComponent} from './pages/sale/sale.component';
import {LogoutComponent} from './menu/logout/logout.component';
import {CreateClientComponent} from './pages/create-client/create-client.component';
import {CreateSupplierComponent} from './pages/create-supplier/create-supplier.component';
import {MagazzinoComponent} from './pages/magazzino/magazzino.component';

export const routes: Routes = [
  {
    path: 'clients', // <your-domain>/path
    component: ClientsComponent,
  },
  {
    path: 'new-client',
    component: CreateClientComponent
  },
  {
    path: 'suppliers', // <your-domain>/path
    component: SuppliersComponent,
  },
  {
    path: 'new-suppliers', // <your-domain>/path
    component: CreateSupplierComponent,
  },
  {
    path: 'report', // <your-domain>/path
    component: ReportComponent,
  },
  {
    path: 'sale', // <your-domain>/path
    component: SaleComponent,
  },
  {
    path: 'magazzino', // <your-domain>/path
    component: MagazzinoComponent,
  },
  { path: 'logout',
    component: LogoutComponent
  },
  {
    path: '',
    redirectTo: '/magazzino',
    pathMatch: 'full',
  },
];
