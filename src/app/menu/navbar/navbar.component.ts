import {Component, OnInit, signal} from '@angular/core';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {MENU_ITEMS} from '../../menu-items';
import {NgForOf} from '@angular/common';
import {filter, takeUntil} from 'rxjs/operators';
import {MsalBroadcastService, MsalService} from '@azure/msal-angular';
import {
  AuthenticationResult,
  EventError,
  EventMessage,
  EventType,
  InteractionRequiredAuthError
} from '@azure/msal-browser';
import {Subject} from 'rxjs';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    NgForOf,
    FormsModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  private destroying$ = new Subject<void>();

  constructor(private router: Router, private msal: MsalService, private msalBroadcast: MsalBroadcastService) {
  }

  protected readonly menuItems = MENU_ITEMS;
  protected selectedItem = signal(this.menuItems[0]);

  ngOnInit() {

    this.msal.initialize().subscribe(() => {
      console.log(this.msal.instance.getAllAccounts());
      // Gestisce il redirect dopo il login in Entra
      this.loginHandleRedirect();
    })

    // MsalInterceptor verifica:
    // 1. Se il token è valido allora lo utilizza per le API
    // 2. Se il token non è valido utilizza il refreshToken per ottenerne uno valido.
    // 3. Se anche il refreshToken è scaduto (in genere 24h) allora questo metodo entra in gioco forzando un nuovo login.
    this.tokenExpiredHandler();

    // Aggiorna stato all'avvio e ad ogni navigazione
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const activeRoute = event.urlAfterRedirects.substring(1);
        let menuItem = this.menuItems[0];
        this.menuItems.forEach(item => {
          if (activeRoute.includes(item.route)) {
            menuItem = item;
          }
        })
        this.selectedItem.set(menuItem);
      });
  }

  loginHandleRedirect() {
    this.msal.instance
      // handleRedirectPromise gestisce il flusso OAuth2/OIDC Authorization Code + PKCE
      .handleRedirectPromise()
      .then((result: AuthenticationResult | null) => {
        if (result) {
          // setta l'account corrente in MSAL, così da poterlo recuperare in seguito con getActiveAccount() o getAllAccounts()
          this.msal.instance.setActiveAccount(result.account);
        }
      });
  }

  tokenExpiredHandler() {
    // Se il token è scaduto, forza un nuovo login
    this.msalBroadcast.msalSubject$
      .pipe(
        filter(
          (event: EventMessage) =>
            event.eventType === EventType.ACQUIRE_TOKEN_FAILURE
        ),
        takeUntil(this.destroying$)
      )
      .subscribe((event: EventMessage) => {
        const error = event.error;
        if (this.isNecessaryToGetANewSilentToken(error)) {
          this.login();
        }
      });

  }

  isNecessaryToGetANewSilentToken(eventError: EventError): boolean {
    return this.isEventErrorInstanceOfInteractionAuthError(eventError) || this.isTheErrorMessageTypeOfInteractionRequired(eventError);
  }

  isEventErrorInstanceOfInteractionAuthError(eventError: EventError) {
    return eventError instanceof InteractionRequiredAuthError;
  }

  isTheErrorMessageTypeOfInteractionRequired(eventError: EventError) {
    return (typeof eventError?.message === 'string' && eventError.message.includes('interaction_required'))
  }

  login(): void {
    this.msal.loginRedirect();
  }

  logout() {
    console.log('Logout');
    this.msal.logoutRedirect();
  }
}
