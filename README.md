# 🚚 **ParcelPulse Frontend (Courier Portal)**

[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=0B1F2A)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Netlify](https://img.shields.io/badge/Deployed%20on-Netlify-00C7B7?logo=netlify&logoColor=white)](https://www.netlify.com/)

🔗 **Production UI**: [ParcelPulse Service](https://parcel-pulse-service.netlify.app/)

---

## 🚀 **About ParcelPulse**

ParcelPulse is a **role-based courier portal** designed for efficient parcel management across three user roles:
- **Admin**: Overview of operations, user management, parcels, assignments, and reports.
- **Agent**: View assigned tasks, update statuses, share live locations, and view routes.
- **Customer**: Book parcels, view history, check parcel details, and live tracking.

Integrates with a **REST API** for data and a **WebSocket channel** for real-time parcel location updates.

---

## ✨ **Key Features**

- **Role-Based Authentication**: Separate dashboards for Admin, Agent, and Customer.
- **Admin Dashboards**: Manage parcels, users, assignments, and generate reports.
- **Agent Dashboard**: Manage tasks, update statuses, and share live locations via WebSocket.
- **Customer Dashboard**: View live parcel tracking and parcel details with maps.
- **Interactive Maps**: **Leaflet** integration for live tracking and route display.
- **Typed API**: Type-safe API interactions with caching and invalidation for performance.
- **Responsive UI**: Designed with **TailwindCSS** for a modern "glass UI" effect.
- **Toast Notifications**: Real-time notifications on UI events.

---

## 🛠️ **Tech Stack**

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **UI Framework**: Tailwind CSS
- **HTTP Client**: Axios (for REST API)
- **Realtime**: WebSocket
- **Map Integration**: Leaflet + React Leaflet
- **Forms**: react-hook-form
- **Localization**: i18next (EN/BN support)

---

## 📂 **Project Structure**

```plaintext
src/
  pages/              # Route-level screens (admin/agent/customer)
  routes/             # React Router configuration & guards
  services/           # REST & WebSocket clients, API types
  components/         # UI components and maps
  context/            # Auth context & role state management
  lib/                # Utilities (toasts, icons, navigation)
public/
  _redirects          # SPA fallback for Netlify
  

  🏃‍♂️ Getting Started Locally
Prerequisites

Node.js 18+ (recommended: Node 20/22)

Install & Run
npm install
npm run dev

Environment Variables

Create a .env file by copying .env.example and update with your local or production URLs:

Variable	Purpose	Example
VITE_BACKEND_API_URL	REST API base URL	http://localhost:5000/api
VITE_BACKEND_WS_URL	WebSocket base URL	ws://localhost:5000/ws

For production, use these values:

VITE_BACKEND_API_URL=https://percel-pulse-backend.onrender.com/api
VITE_BACKEND_WS_URL=wss://percel-pulse-backend.onrender.com/ws

🔧 Scripts

Development: npm run dev — Start Vite development server

Build: npm run build — Create a production build

Preview: npm run preview — Preview production build locally

Lint: npm run lint — Run ESLint

Typecheck: npm run typecheck — Run TypeScript type check

🌐 Deployment
Netlify (Static)

Build Command: npm run build

Publish Directory: dist

SPA Routing (via public/_redirects):

/*    /index.html   200

Render

Deploying on Render (Static Site):

Build Command: npm install && npm run build

Publish Directory: dist

Rewrite Rule: /* → /index.html (200)

For Web Service, use npm run preview:

npm run preview -- --host 0.0.0.0 --port $PORT