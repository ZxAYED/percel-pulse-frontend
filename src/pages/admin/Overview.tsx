import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import { CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { MotionCard } from "../../components/ui/motion";
import { PageTitle } from "../../components/ui/title";
import { adminAssignments, adminMetrics } from "../../data/admin";

const defaultCenter: [number, number] = [23.8103, 90.4125];
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

export default function Overview() {
  const events = [
    { title: "35 parcels dispatched", time: "12:24 PM", badge: "In transit" },
    { title: "Route updated for Gulshan", time: "12:02 PM", badge: "Optimized" },
    { title: "5 COD settled", time: "11:40 AM", badge: "Finance" },
    { title: "2 delays flagged", time: "11:05 AM", badge: "Risk" },
  ];

  const lifecycle = [
    { label: "Picked up", value: 32, percent: 42, tone: "from-cyan-300 to-blue-400" },
    { label: "In transit", value: 86, percent: 68, tone: "from-primary to-emerald-300" },
    { label: "Delivered", value: 1_152, percent: 92, tone: "from-emerald-300 to-emerald-500" },
    { label: "Failed", value: 12, percent: 8, tone: "from-amber-300 to-amber-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageTitle>Admin control room</PageTitle>
          <p className="text-sm text-muted-foreground">
            Daily bookings, COD, failed deliveries, assignments, and live geolocation in one panel.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
          <span className="rounded-full bg-secondary px-3 py-1 text-primary">Live board</span>
          <span className="rounded-full bg-secondary px-3 py-1">Socket ready</span>
          <span className="rounded-full bg-secondary px-3 py-1">Maps</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminMetrics.map((item) => (
          <MotionCard key={item.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-[0.12em] text-muted-foreground">{item.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-4xl font-semibold text-foreground">{item.value}</div>
              <p className="text-xs text-emerald-600">{item.helper}</p>
              <div className="h-2 rounded-full bg-secondary">
                <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-primary to-emerald-300" />
              </div>
            </CardContent>
          </MotionCard>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
        <MotionCard className="p-0">
          <CardHeader className="flex flex-col gap-2 border-b border-[hsl(var(--border))] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">Live map snapshot</CardTitle>
              <p className="text-sm text-muted-foreground">Pinned sidebar + map to track geolocation in real-time.</p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">Google Maps ready</span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[420px] w-full overflow-hidden rounded-[28px] border border-[hsl(var(--border))]">
              <MapContainer center={defaultCenter} zoom={12} className="h-full w-full">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={defaultCenter} icon={markerIcon}>
                  <Popup>Head Office</Popup>
                </Marker>
                <Polyline positions={[defaultCenter, [23.75, 90.39], [23.70, 90.42]]} color="#22c55e" weight={5} />
              </MapContainer>
            </div>
          </CardContent>
        </MotionCard>

        <MotionCard className="p-0">
          <CardHeader className="border-b border-[hsl(var(--border))] px-6 py-5">
            <CardTitle className="text-xl font-semibold text-foreground">Realtime events</CardTitle>
            <p className="text-sm text-muted-foreground">Status changes, pickups, and COD updates.</p>
          </CardHeader>
          <CardContent className="space-y-3 px-6 py-5">
            {events.map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                  {item.badge}
                </span>
              </div>
            ))}
          </CardContent>
        </MotionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr,1fr]">
        <MotionCard>
          <CardHeader>
            <CardTitle>Parcel lifecycle</CardTitle>
            <p className="text-sm text-muted-foreground">Snapshot of each status column to mirror the board.</p>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {lifecycle.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[hsl(var(--border))] bg-secondary p-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.tone}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </MotionCard>

        <MotionCard>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
            <p className="text-sm text-muted-foreground">Pair agents to parcels and keep a trail for SLA checks.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {adminAssignments.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.id}</p>
                  <p className="text-xs text-muted-foreground">{item.status} · {item.lane}</p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">Agent: {item.agent}</span>
              </div>
            ))}
          </CardContent>
        </MotionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
        <MotionCard>
          <CardHeader>
            <CardTitle>User & role matrix</CardTitle>
            <p className="text-sm text-muted-foreground">Admin, delivery agent, customer roles aligned with RBAC.</p>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {[
              { title: "Admins", count: 4, desc: "Assign agents, export, manage payouts" },
              { title: "Agents", count: 32, desc: "Update status, scan barcodes, confirm delivery" },
              { title: "Customers", count: 4_180, desc: "Book, track on map, view history" },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[hsl(var(--border))] bg-secondary p-4">
                <p className="text-sm uppercase tracking-[0.12em] text-muted-foreground">{item.title}</p>
                <p className="text-3xl font-semibold text-foreground">{item.count}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </CardContent>
        </MotionCard>

        <MotionCard>
          <CardHeader>
            <CardTitle>Reports & exports</CardTitle>
            <p className="text-sm text-muted-foreground">CSV / PDF exports for bookings, COD, failed deliveries.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "Monthly performance", helper: "Bookings, delivered, failed", badge: "Export" },
              { title: "COD statement", helper: "Settlement ready 18:00", badge: "CSV/PDF" },
              { title: "Audit trail", helper: "Role-based access control", badge: "Download" },
            ].map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.helper}</p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">{item.badge}</span>
              </div>
            ))}
          </CardContent>
        </MotionCard>
      </div>
    </div>
  );
}
