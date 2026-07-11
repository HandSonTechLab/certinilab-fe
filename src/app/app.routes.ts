import {Routes} from '@angular/router';
import {ClientsComponent} from './pages/clients/clients.component';
import {SuppliersComponent} from './pages/suppliers/suppliers.component';
import {ReportComponent} from './pages/report/report.component';
import {CreateClientComponent} from './pages/create-client/create-client.component';
import {CreateSupplierComponent} from './pages/create-supplier/create-supplier.component';
import {MagazzinoComponent} from './pages/magazzino/magazzino.component';
import {GestioneLottiComponent} from './pages/gestione-lotti/gestione-lotti.component';
import {RegistrazioneVenditaComponent} from './pages/registrazione-vendita/registrazione-vendita.component';
import {VenditeComponent} from './pages/vendite/vendite.component';
// TODO(msal-disabled): MSAL/Entra ID authentication is temporarily disabled. Uncomment this
// import and every `canActivate: [MsalGuard]` line below to restore route protection.
// import {MsalGuard} from '@azure/msal-angular';
import {LogoutSuccessComponent} from './pages/logout-success/logout-success.component';

export const routes: Routes = [
  {
    path: '',
    component: MagazzinoComponent,
    // TODO(msal-disabled): route guard disabled, see above.
    // canActivate: [MsalGuard]
  },
  {
    path: 'clienti',
    component: ClientsComponent,
    // TODO(msal-disabled): route guard disabled, see above.
    // canActivate: [MsalGuard]
  },
  {
    path: 'nuovi-clienti',
    component: CreateClientComponent,
    // TODO(msal-disabled): route guard disabled, see above.
    // canActivate: [MsalGuard]
  },
  {
    path: 'fornitori',
    component: SuppliersComponent,
    // TODO(msal-disabled): route guard disabled, see above.
    // canActivate: [MsalGuard]
  },
  {
    path: 'nuovi-fornitori',
    component: CreateSupplierComponent,
    // TODO(msal-disabled): route guard disabled, see above.
    // canActivate: [MsalGuard]
  },
  {
    path: 'gestione-lotti',
    component: GestioneLottiComponent,
    // TODO(msal-disabled): route guard disabled, see above.
    // canActivate: [MsalGuard]
  },
  {
    path: 'report',
    component: ReportComponent,
    // TODO(msal-disabled): route guard disabled, see above.
    // canActivate: [MsalGuard]
  },
  {
    path: 'lotti',
    component: MagazzinoComponent,
    // TODO(msal-disabled): route guard disabled, see above.
    // canActivate: [MsalGuard]
  },
  {
    path: 'vendite',
    component: VenditeComponent,
    // TODO(msal-disabled): route guard disabled, see above.
    // canActivate: [MsalGuard]
  },
  {
    path: 'gestione-vendite',
    component: RegistrazioneVenditaComponent,
    // TODO(msal-disabled): route guard disabled, see above.
    // canActivate: [MsalGuard]
  },
  {
    path: 'logout-success',
    component: LogoutSuccessComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
