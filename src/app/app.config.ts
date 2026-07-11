import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
// TODO(msal-disabled): MSAL/Entra ID authentication is temporarily disabled. Uncomment this
// import and the provider block below to restore it.
// import {
//   MSAL_GUARD_CONFIG,
//   MSAL_INSTANCE,
//   MSAL_INTERCEPTOR_CONFIG,
//   MsalBroadcastService,
//   MsalGuard,
//   MsalInterceptor,
//   MsalService
// } from '@azure/msal-angular';
// import {MSALGuardConfigFactory, MSALInstanceFactory, MSALInterceptorConfigFactory} from './auth-config';

// dependency injection container
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),

    // TODO(msal-disabled): MSAL core providers disabled. Uncomment to restore Entra ID auth.
    // // MSAL core
    //     {
    //       provide: MSAL_INSTANCE,
    //       useFactory: MSALInstanceFactory
    //     },
    //     {
    //       provide: MSAL_GUARD_CONFIG,
    //       useFactory: MSALGuardConfigFactory
    //     },
    //     {
    //       provide: MSAL_INTERCEPTOR_CONFIG,
    //       useFactory: MSALInterceptorConfigFactory
    //     },
    //     MsalService,
    //     MsalGuard,
    //     MsalBroadcastService,
    //     {
    //       provide: HTTP_INTERCEPTORS,
    //       useClass: MsalInterceptor,
    //       multi: true
    //     }
  ],

}
