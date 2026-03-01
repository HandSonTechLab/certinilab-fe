import {Routes} from '@angular/router';
import {ClientsComponent} from './pages/clients/clients.component';
import {SuppliersComponent} from './pages/suppliers/suppliers.component';
import {ReportComponent} from './pages/report/report.component';
import {SaleComponent} from './pages/sale/sale.component';
import {CreateClientComponent} from './pages/create-client/create-client.component';
import {CreateSupplierComponent} from './pages/create-supplier/create-supplier.component';
import {MagazzinoComponent} from './pages/magazzino/magazzino.component';
import {GestioneLottiComponent} from './pages/gestione-lotti/gestione-lotti.component';
import {RegistrazioneVenditaComponent} from './pages/registrazione-vendita/registrazione-vendita.component';
// import {MsalGuard} from '@azure/msal-angular';

export const routes: Routes = [
  {
    path: '',
    component: MagazzinoComponent,
    //canActivate: [MsalGuard]
  },
  {
    path: 'clienti',
    component: ClientsComponent,
    //canActivate: [MsalGuard]
  },
  {
    path: 'nuovi-clienti',
    component: CreateClientComponent,
    //canActivate: [MsalGuard]
  },
  {
    path: 'fornitori',
    component: SuppliersComponent,
    //canActivate: [MsalGuard]
  },
  {
    path: 'nuovi-fornitori',
    component: CreateSupplierComponent,
    //canActivate: [MsalGuard]
  },
  {
    path: 'gestione-lotti',
    component: GestioneLottiComponent,
    //canActivate: [MsalGuard]
  },
  {
    path: 'report',
    component: ReportComponent,
    //canActivate: [MsalGuard]
  },
  {
    path: 'vendita-al-banco',
    component: SaleComponent,
    //canActivate: [MsalGuard]
  },
  {
    path: 'lotti',
    component: MagazzinoComponent,
    //canActivate: [MsalGuard]
  },
  {
    path: 'gestione-vendite',
    component: RegistrazioneVenditaComponent
  },
  {
    path: '**',
    redirectTo: '',
  },
];
