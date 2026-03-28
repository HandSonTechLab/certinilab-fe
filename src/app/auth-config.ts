import {InteractionType, type IPublicClientApplication, LogLevel, PublicClientApplication} from '@azure/msal-browser';
import {MsalGuardConfiguration, MsalInterceptorConfiguration} from '@azure/msal-angular';

export const msalConfig = {
  auth: {
    // ID dell'applicazione registrata in Azure AD e dice ad Entra ID qual è il client che sta chiedendo i token.
    clientId: '3341bcc2-589a-4911-bbea-c32fa387491d',
    // endpoint dell'external tenant e serve a MSAL per indirizzare l'utente alla login e da dove accettare i token.
    authority: 'https://cloudsaasmanagement.ciamlogin.com/c7f158c6-9d4c-4789-ae4e-664fbdb8f405',
    // url di DEV utile per redirect dove Entra ID rimanda l'utente dopo la login. Questo URL deve essere registrato anche nell'APP Registration.
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200', // oppure una pagina libera da MsalGuard /welcome
  },
  cache: {
    // dove MSAL memorizza i token. localStorage persiste anche dopo la chiusura del browser, sessionStorage invece no.
    cacheLocation: 'localStorage' as const,
    // se true MSAL memorizza anche lo stato dell'autenticazione nei cookie, utile per browser che non supportano localStorage o sessionStorage.
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      // callback chiamata da MSAL per loggare eventi
      loggerCallback: (level: LogLevel, message: string) => {
        console.log(message);
      },
      logLevel: LogLevel.Info,
      // se true, MSAL logga anche informazioni personali come username o token, utile per debug ma da disabilitare in produzione.
      piiLoggingEnabled: false,
    },
  },
};

// loginRequest è l'oggeto che descrive cosa chiedere a Entra ID durante la login
// oggetto usato da MSALGuardConfigFactory
// In questo caso stiamo chiedendo:
// - openid: per ottenere un ID token che identifica l'utente
// - profile: per ottenere informazioni di base sull'utente come nome e cognome nel token
// - email: per ottenere l'email dell'utente inclusa nei claim del token
export const loginRequest = {
  scopes: ['openid', 'profile', 'email']
};

// MSAL instance
export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig);
}

// come MSAL si comporta quando blocca una rotta
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    // se utente non autenticato, allora MSAL deve fare redirect per la login
    interactionType: InteractionType.Redirect,
    authRequest: loginRequest
  };
}

// come MSAL si comporta quando intercetta una chiamata HTTP verso un API protetta
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  return {
    // Se per ottenere un token per una certa API manca il consenso, allora MSAL deve fare redirect per chiedere il consenso all'utente
    interactionType: InteractionType.Redirect,
    // mappa URL -> SCOPEs, usata da MSAL per capire quali scope chiedere a Entra ID quando intercetta una chiamata HTTP verso un certo URL
    protectedResourceMap: new Map<string, string[]>([
    ])
  };
}
