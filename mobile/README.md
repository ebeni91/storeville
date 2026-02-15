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

```bash
cd mobile
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
