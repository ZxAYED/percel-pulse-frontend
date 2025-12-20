# ParcelPulse Frontend (Courier Portal)

[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=0B1F2A)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Netlify](https://img.shields.io/badge/Deployed%20on-Netlify-00C7B7?logo=netlify&logoColor=white)](https://www.netlify.com/)

Production UI: https://parcel-pulse-service.netlify.app/

## About

ParcelPulse is a role-based courier portal frontend with three workspaces:
- Admin: operations overview, users, parcels, assignments, reports
- Agent: assigned tasks, status updates, live location sharing, route map
- Customer: booking, parcel history, parcel details, live tracking

It integrates with a REST API for data and a WebSocket channel for realtime parcel location updates.

## Key Features

- Role-based authentication and routing (`ADMIN`, `AGENT`, `CUSTOMER`)
- Admin dashboards and management screens (parcels, users, assignments, reports)
- Agent task list with status updates and live location updates (REST + WebSocket)
- Customer parcel details with live tracking map updates
- Map UI built with Leaflet (markers + polylines)
- Typed API layer with lightweight client-side caching and invalidation
- Responsive “glass UI” components and toast notifications

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS
- Axios (REST client)
- WebSocket (realtime)
- Leaflet + React Leaflet (maps)
- react-hook-form (forms)
- i18next (EN/BN labels)

## Project Structure

```text
src/
  pages/              Route-level screens (admin/agent/customer)
  routes/             React Router configuration and guards
  services/           REST + WebSocket clients + API types
  components/         UI components and maps
  context/            Auth context and role state
  lib/                Utilities (toasts, icons, navigation)
public/
  _redirects           SPA fallback for Netlify
```

## Getting Started (Local)

### Prerequisites

- Node.js 18+ (recommended: Node 20/22)

### Install & Run

```bash
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` → `.env` and update values:

| Variable | Purpose | Example |
|---|---|---|
| `VITE_BACKEND_API_URL` | REST API base URL | `http://localhost:5000/api` |
| `VITE_BACKEND_WS_URL` | WebSocket base URL | `ws://localhost:5000/ws` |

For a backend hosted on Render at `https://percel-pulse-backend.onrender.com`, use:
- `VITE_BACKEND_API_URL=https://percel-pulse-backend.onrender.com/api`
- `VITE_BACKEND_WS_URL=wss://percel-pulse-backend.onrender.com/ws`

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - production build to `dist/`
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript typecheck

## Deployment

### Netlify (Static)

- Build command: `npm run build`
- Publish directory: `dist`

SPA routing is handled via `public/_redirects`:
```text
/*    /index.html   200
```

### Render

If deploying on Render, use a **Static Site**:
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Rewrite rule: `/*` → `/index.html` (200)

If you created a **Web Service** by mistake, do not use `node index.js` (this project has no server entry file). Use either a Static Site or `npm run preview -- --host 0.0.0.0 --port $PORT`.

## Notes

- Auth token is stored in `localStorage` and attached as `Authorization` for API requests.
- WebSocket connects to `/ws` and authenticates by sending `{ "type": "auth", "token": "<accessToken>" }`.
