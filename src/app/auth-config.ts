// src/app/auth-config.ts
import {InteractionType, type IPublicClientApplication, LogLevel, PublicClientApplication} from '@azure/msal-browser';
import {MsalGuardConfiguration, MsalInterceptorConfiguration} from '@azure/msal-angular';

export const msalConfig = {
  auth: {
    clientId: '36e90f61-63f5-46be-abc9-60edea3dba23',
    authority: 'https://poultryfarmsaas.ciamlogin.com/ce8eef6a-5650-4ca9-89cd-92c5d99fb298',
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

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap: new Map<string, string[]>([
      // da riempire quando userai APIM
    ])
  };
}
