# 📦 ParcelPulse Frontend — Courier Portal

[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=0B1F2A)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Netlify](https://img.shields.io/badge/Deployed%20on-Netlify-00C7B7?logo=netlify&logoColor=white)](https://www.netlify.com/)

🌐 **Live Production UI**  
👉 https://parcel-pulse-service.netlify.app/

---

## 🚀 About ParcelPulse

**ParcelPulse** is a **role-based courier management frontend** built for real-world logistics operations.  
It provides **three dedicated workspaces** with real-time parcel visibility and task workflows.

### 👥 Supported Roles
- **🛠 Admin** – Operations overview, users, parcels, assignments, reports  
- **🚚 Agent** – Assigned tasks, status updates, live location sharing, route map  
- **📦 Customer** – Parcel booking, history, parcel details, live tracking  

The frontend integrates with:
- **REST APIs** for CRUD and dashboards  
- **WebSocket channels** for real-time parcel & agent location updates  

---

## ✨ Key Features

- 🔐 Role-based authentication & routing (`ADMIN`, `AGENT`, `CUSTOMER`)
- 📊 Admin dashboards for parcels, users, assignments, and reports
- 🚚 Agent task list with status updates & live GPS streaming
- 🗺 Customer live parcel tracking with route visualization
- 📍 Interactive maps using Leaflet (markers + polylines)
- ⚡ Typed API layer with lightweight caching & invalidation
- 🎨 Modern glass-morphism UI with toast notifications

---

## 🧰 Tech Stack

### Frontend
- ⚛️ React 19 + TypeScript
- ⚡ Vite 7
- 🎨 Tailwind CSS

### Data & Realtime
- 🔗 Axios (REST client)
- 🔌 WebSocket (real-time streaming)
- 🗺 Leaflet + React Leaflet (maps)

### UX & DX
- 📝 react-hook-form (forms)
- 🌍 i18next (English / Bengali localization)

---

## 🗂 Project Structure

```text
src/
 ├─ pages/              # Route-level screens (Admin / Agent / Customer)
 ├─ routes/             # React Router config & role guards
 ├─ services/           # REST & WebSocket clients + typed APIs
 ├─ components/         # Shared UI components & maps
 ├─ context/            # Auth context & role state
 ├─ lib/                # Utilities (toasts, icons, navigation)
public/
 └─ _redirects          # SPA fallback for Netlify
