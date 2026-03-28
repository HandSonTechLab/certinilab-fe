import {Component, inject, OnInit} from '@angular/core';
import {NavbarComponent} from './menu/navbar/navbar.component';
import {RouterOutlet} from '@angular/router';
import {ErrorService} from './shared/error.service';
import {ErrorModalComponent} from './shared/modal/error-modal/error-modal.component';
import {CONSTANTS} from './shared/constants';
import {LoginService} from './services/login/login.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet, ErrorModalComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'certinilab-fe';
  private errorService = inject(ErrorService);
  private loginService = inject(LoginService);
  error = this.errorService.error;
  protected readonly errorTitle = CONSTANTS.create_client_request_error_title;
  protected isLoggedIn = false;

  ngOnInit(): void {
    console.log('AppComponent initialized');
    this.isLoggedIn = localStorage.getItem('msal.2.account.keys') !== null;
    // handle redirect dopo login in Entra ID
    this.loginService.loginHandleRedirect();
    // handle token expired
    this.loginService.tokenExpiredHandler()
  }

}
