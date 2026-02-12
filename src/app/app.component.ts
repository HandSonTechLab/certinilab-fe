import {Component, inject} from '@angular/core';
import {NavbarComponent} from './menu/navbar/navbar.component';
import {RouterOutlet} from '@angular/router';
import {ErrorService} from './shared/error.service';
import {ErrorModalComponent} from './shared/modal/error-modal/error-modal.component';
import {CONSTANTS} from './shared/constants';
import {MsalService} from '@azure/msal-angular';
import {msalConfig} from './auth-config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet, ErrorModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'certinilab-fe';
  private errorService = inject(ErrorService);
  error = this.errorService.error;
  protected readonly errorTitle = CONSTANTS.create_client_request_error_title;
  private authService = inject(MsalService);

  logout() {
    this.authService.logoutRedirect({
      postLogoutRedirectUri: msalConfig.auth.authority
    })
  }
}
