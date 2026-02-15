# StoreVille Mobile (React Native)

This folder contains a starter React Native (Expo) app for StoreVille that uses your **Django backend** and **Django REST Framework APIs**.

## Backend integration (Django + DRF)

The mobile API client is wired to these backend endpoints:

- `GET /api/stores/`
- `GET /api/stores/:slug/`
- `POST /api/orders/`
- `GET /api/orders/status/?ref=...`
- `POST /api/users/register/`
- `POST /api/users/login/`

See `src/api/client.ts`.

## Theme mapping from web app

The mobile theme tokens are based on `frontend/app/globals.css` and common utility classes:

- Background: `#f8fafc`
- Foreground: `#0f172a`
- Primary action: `#4f46e5` (`indigo-600`)
- Pressed action: `#4338ca` (`indigo-700`)
- Card: white with subtle border and rounded corners

See `src/theme/theme.ts`.

## Run locally

The project includes a local `.npmrc` with higher retry/timeouts for unstable networks.

```bash
# from repository root
cd mobile
npm install
npm run start

# OR if you are already in mobile/, just run:
npm install
npm run start
```

## Configure API URL

Set API base URL with Expo public env vars:

```bash
EXPO_PUBLIC_API_BASE_URL=http://<your-ip>:8000
```

Notes:

- Android emulator usually needs `http://10.0.2.2:8000`
- iOS simulator can use `http://localhost:8000`
- Physical devices should use your machine LAN IP

## What is included

- `App.tsx` entry point with safe-area container
- `src/theme/theme.ts` reusable visual tokens
- `src/components/ThemedButton.tsx` web-theme-matching primary button
- `src/screens/HomeScreen.tsx` sample screen fetching stores from Django API
- `src/api/client.ts` typed DRF client helpers for stores, orders, and users



## Expo Go SDK mismatch

If Expo Go says your app is SDK 52 and Expo Go is SDK 54, upgrade project deps then reinstall:

```bash
# from mobile/
rm -rf node_modules
npm install
npx expo install --fix
npm run start -c
```

## Troubleshooting `npm install`

If `npm install` fails with `ETIMEDOUT` or other network issues:

1. Verify npm registry:
   ```bash
   npm config get registry
   ```
   It should be `https://registry.npmjs.org/` (or your company mirror).
2. Retry with a clean cache:
   ```bash
   npm cache clean --force
   npm install
   ```
3. If behind a proxy, set it explicitly:
   ```bash
   npm config set proxy http://<proxy-host>:<port>
   npm config set https-proxy http://<proxy-host>:<port>
   ```
4. If your network blocks public npm, configure your internal registry mirror.

Notes about warnings:

- `deprecated` warnings from transitive packages are common in Expo/React Native dependency trees and do **not** automatically mean the app is broken.
- The important signal is whether install exits successfully and whether `expo start` runs.


### `expo-asset` missing error

If `npm run start` fails with `The required package expo-asset cannot be found`:

```bash
# from mobile/
npx expo install expo-asset
npm install
npm run start
```

This repo now pins `expo-asset` in `package.json` so a clean install should include it automatically.
