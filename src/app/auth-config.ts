// src/app/auth-config.ts
import {InteractionType, type IPublicClientApplication, LogLevel, PublicClientApplication} from '@azure/msal-browser';
import {MsalGuardConfiguration} from '@azure/msal-angular';

export const msalConfig = {
  auth: {
    clientId: '<CLIENT_ID_SPA>',
    authority: 'https://<tenantSubdomain>.ciamlogin.com/<TENANT_ID>',
    redirectUri: 'http://localhost:4200',
  },
  cache: {
    cacheLocation: 'localStorage' as const,
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string) => {
        console.log(message);
      },
      logLevel: LogLevel.Info,
      piiLoggingEnabled: false,
    },
  },
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email']
};

// MSAL instance
export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig);
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: loginRequest
  };
}
