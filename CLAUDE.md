# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

CertiniLab FE is an Angular 19 standalone-component app for managing a lab's clients, suppliers, warehouse lots, and sales orders ("magazzino", "vendite", "lotti"). Domain terms and UI strings are in Italian; keep new user-facing strings and comments consistent with that.

## Commands

```bash
npm start          # ng serve, http://localhost:4200
npm run build       # ng build (production)
npm run watch        # ng build --watch --configuration development
npm test              # ng test (Karma/Jasmine)
```

Run a single spec file: `ng test --include='**/clients.service.spec.ts'`.

There is no lint script configured in `package.json`.

## Architecture

### Module structure

The app has no NgModules — everything is a standalone component wired up via `app.config.ts` (the DI root) and `app.routes.ts`. New components should follow this pattern (`standalone: true`, explicit `imports: []` array) rather than introducing NgModules.

- `app/pages/*` — one folder per routed page (clients, suppliers, magazzino, vendite, gestione-lotti, registrazione-vendita, report, create-client, create-supplier, logout-success).
- `app/menu/` — `navbar` and `sidebar` shell components; `menu-items.ts` is the single source of truth for sidebar nav entries (`{name, icon, route}`).
- `app/services/` — one Angular service per backend resource, all `providedIn: 'root'`.
- `app/model/` — plain TS interfaces/types for API DTOs, one file per model.
- `app/shared/` — cross-cutting UI (generic `modal`, `error-modal`, `search-filter`) plus `constants.ts` and `error.service.ts`.

### HTTP services pattern

Every resource service extends `BaseService` (`services/base-service.ts`), which injects `HttpClient`/`ErrorService` and builds the URL as `http://localhost:8080/api/v1/<resourceUrl>` from the constructor arg (e.g. `super("clienti")`). The backend host is currently hardcoded here, not environment-driven.

Every HTTP call follows the same shape: return the raw `Observable<HttpResponse<T>>` (`observe: 'response'`) and pipe a `catchError` that:

1. `console.log`s the error,
2. calls `this.errorService.showError(...)` with a message built from a key in `shared/constants.ts` (grouped by domain: clienti, locali, animali, lotti, fornitori, ordini) plus backend detail from the `X-Error-Message` response header when present,
3. re-throws via `throwError(() => new Error(...))`.

When adding a new endpoint, add the corresponding error-message constant to `CONSTANTS` in `shared/constants.ts` first, then mirror this pattern — don't invent a different error-handling style.

### Global error display

`ErrorService` (`shared/error.service.ts`) holds a single writable signal (`_error`) exposed read-only as `error`. `AppComponent` reads it and renders `ErrorModalComponent` app-wide; any service can trigger it via `showError()`, and the modal calls `clearError()` on dismiss. There is one global error slot, not a per-component error state.

### Auth (MSAL / Entra External ID)

Auth is Microsoft Entra (Azure AD B2C-style external tenant) via `@azure/msal-angular` + `@azure/msal-browser`, configured in `auth-config.ts`:

- `msalConfig` — client ID, authority, redirect/post-logout URIs, `localStorage` token cache.
- `MSALGuardConfigFactory` — redirect-based interaction; every protected route uses `canActivate: [MsalGuard]` in `app.routes.ts`.
- `MSALInterceptorConfigFactory` — `protectedResourceMap` maps API URLs to required scopes for the `MsalInterceptor` (registered as an `HTTP_INTERCEPTORS` provider in `app.config.ts`); currently empty, so add entries here when wiring calls to a scope-protected API.

`LoginService` (`services/login/login.service.ts`) wraps `MsalService`/`MsalBroadcastService`:

- `loginHandleRedirect()` — called from `AppComponent.ngOnInit`, completes the OIDC redirect flow and sets the active MSAL account.
- `tokenExpiredHandler()` — listens for `ACQUIRE_TOKEN_FAILURE` and forces a fresh `loginRedirect()` when the failure is interaction-required (silent refresh no longer possible).
- `logout()` clears `localStorage` then calls `msalService.logoutRedirect()`.

`AppComponent` derives `isLoggedIn` by checking for the `msal.2.account.keys` key in `localStorage` (not an MSAL API call) to toggle navbar visibility.

### Routing

All routes except `logout-success` are guarded by `MsalGuard`. `''` and `lotti` both map to `MagazzinoComponent`. Unknown paths redirect to `''`. Page components navigate with in-memory `router.navigate([...], {state: {...}})` (see `VenditeComponent.newVendita`) to pass transient data like `activeMode` without query params.

### Styling

Bootstrap 5 + Bootstrap Icons are used globally (imported in `angular.json`/`styles.css`); some legacy JS-driven Bootstrap components (tooltips) are used via `declare var bootstrap: any` rather than an Angular wrapper — see `VenditeComponent`.
