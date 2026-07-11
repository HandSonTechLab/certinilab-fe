import {Injectable} from '@angular/core';
// TODO(msal-disabled): MSAL/Entra ID authentication is temporarily disabled. Uncomment these
// imports to restore the original implementation below.
// import {
//   AuthenticationResult,
//   EventError,
//   EventMessage,
//   EventType,
//   InteractionRequiredAuthError
// } from '@azure/msal-browser';
// import {Subject, takeUntil} from 'rxjs';
// import {filter} from 'rxjs/operators';
// import {MsalBroadcastService, MsalService} from '@azure/msal-angular';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  // TODO(msal-disabled): MSAL is disabled, so the MsalService/MsalBroadcastService
  // dependencies below are commented out (they are no longer provided in app.config.ts).
  // Public method signatures are preserved as no-ops so existing callers (NavbarComponent,
  // LogoutSuccessComponent, AppComponent) keep compiling and running without MSAL.

  // private destroying$ = new Subject<void>();

  // constructor(private msalService: MsalService, private msalBroadcast: MsalBroadcastService) {
  // }

  logout() {
    // TODO(msal-disabled): restore original MSAL logout logic below.
    // localStorage.clear();
    // this.msalService.logoutRedirect();
  }

  login(): void {
    // TODO(msal-disabled): restore original MSAL login logic below.
    // this.msalService.loginRedirect();
  }

  // Gestisce il redirect dopo il login in Entra
  loginHandleRedirect() {
    // TODO(msal-disabled): restore original MSAL redirect handling logic below.
    //   this.msalService.initialize().subscribe(() => {
    //     this.msalService.instance
    //       // handleRedirectPromise gestisce il flusso OAuth2/OIDC Authorization Code + PKCE
    //       .handleRedirectPromise()
    //       .then((result: AuthenticationResult | null) => {
    //         if (result) {
    //           // setta l'account corrente in MSAL, così da poterlo recuperare in seguito con getActiveAccount() o getAllAccounts()
    //           this.msalService.instance.setActiveAccount(result.account);
    //         }
    //       });
    //   })
  }

    // MsalInterceptor verifica:
    // 1. Se il token è valido allora lo utilizza per le API
    // 2. Se il token non è valido utilizza il refreshToken per ottenerne uno valido.
    // 3. Se anche il refreshToken è scaduto (in genere 24h) allora questo metodo entra in gioco forzando un nuovo login.
    tokenExpiredHandler() {
      // TODO(msal-disabled): restore original MSAL token-expired handling logic below.
      // Se il token è scaduto, forza un nuovo login
      // this.msalBroadcast.msalSubject$
      //   .pipe(
      //     filter(
      //       (event: EventMessage) =>
      //         event.eventType === EventType.ACQUIRE_TOKEN_FAILURE
      //     ),
      //     takeUntil(this.destroying$)
      //   )
      //   .subscribe((event: EventMessage) => {
      //     const error = event.error;
      //     if (this.isNecessaryToGetANewSilentToken(error)) {
      //       this.login();
      //     }
      //   });
    }

  // TODO(msal-disabled): unused while MSAL is disabled; kept for restoration.
  // isNecessaryToGetANewSilentToken(eventError: EventError): boolean {
  //   return this.isEventErrorInstanceOfInteractionAuthError(eventError) || this.isTheErrorMessageTypeOfInteractionRequired(eventError);
  // }

  // isEventErrorInstanceOfInteractionAuthError(eventError: EventError) {
  //   return eventError instanceof InteractionRequiredAuthError;
  // }

  // isTheErrorMessageTypeOfInteractionRequired(eventError: EventError) {
  //   return (typeof eventError?.message === 'string' && eventError.message.includes('interaction_required'))
  // }

}