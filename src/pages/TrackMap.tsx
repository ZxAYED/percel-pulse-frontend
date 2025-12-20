import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { MotionCard } from "../components/ui/motion";
import { PageTitle, SectionTitle } from "../components/ui/title";
import { useAuth } from "../hooks/useAuth";
import { toastError } from "../lib/utils";
import { getAgentActiveRoute } from "../services/parcels";
import type { AgentActiveRouteMarker, AgentActiveRouteResponse, ParcelStatus } from "../services/types";

type LatLngTuple = [number, number];

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

export default function TrackMap() {
  const { role } = useAuth();
  const [data, setData] = useState<AgentActiveRouteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getAgentActiveRoute({ page: 1, limit: 100 })
      .then((res) => {
        setData(res);
      })
      .catch((err: unknown) => {
        setData(null);
        setError("Failed to load active route.");
        toastError(err, "Failed to load active route");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (role !== "AGENT") {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }
    load();
  }, [load, role]);

  const markers = data?.markers ?? [];
  const parcels = data?.data ?? [];
  const summary = data?.summary;

  const markerByParcel = useMemo(() => {
    const by = new Map<string, { pickup?: AgentActiveRouteMarker; delivery?: AgentActiveRouteMarker; current?: AgentActiveRouteMarker }>();
    for (const m of markers) {
      const existing = by.get(m.parcelId) ?? {};
      if (m.type === "pickup") existing.pickup = m;
      if (m.type === "delivery") existing.delivery = m;
      if (m.type === "current") existing.current = m;
      by.set(m.parcelId, existing);
    }
    return by;
  }, [markers]);

  const polylines = useMemo(() => {
    const lines: Array<{ parcelId: string; trackingNumber: string; status: ParcelStatus; points: LatLngTuple[] }> = [];
    for (const p of parcels) {
      const m = markerByParcel.get(p.id);
      const points: LatLngTuple[] = [];
      const push = (x: AgentActiveRouteMarker | undefined) => {
        if (!x) return;
        const lat = Number(x.latitude);
        const lng = Number(x.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng)) points.push([lat, lng]);
      };
      push(m?.pickup);
      push(m?.current);
      push(m?.delivery);
      if (points.length >= 2) {
        lines.push({ parcelId: p.id, trackingNumber: p.trackingNumber, status: p.status, points });
      }
    }
    return lines;
  }, [markerByParcel, parcels]);

  const bounds = useMemo(() => {
    const pts: LatLngTuple[] = [];
    for (const m of markers) {
      const lat = Number(m.latitude);
      const lng = Number(m.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) pts.push([lat, lng]);
    }
    if (!pts.length) return undefined;
    return pts as any;
  }, [markers]);

  const center = useMemo<LatLngTuple>(() => {
    const current = markers.find((m) => m.type === "current");
    const fallback = markers[0];
    const chosen = current ?? fallback;
    const lat = chosen ? Number(chosen.latitude) : 23.8103;
    const lng = chosen ? Number(chosen.longitude) : 90.4125;
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    return [23.8103, 90.4125];
  }, [markers]);

  const colorForStatus = (status: ParcelStatus) => {
    if (status === "BOOKED") return "#f59e0b";
    if (status === "PICKED_UP") return "#06b6d4";
    if (status === "IN_TRANSIT") return "#3b82f6";
    if (status === "DELIVERED") return "#10b981";
    return "#ef4444";
  };

  return (
    <div className="min-h-screen">
      <main className="w-full space-y-6 px-4 lg:px-10 lg:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <PageTitle>Active route</PageTitle>
            <p className="text-sm text-muted-foreground">Pickup, delivery, and current locations for assigned parcels.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={load} className="gap-2" disabled={loading || role !== "AGENT"}>
              <RefreshCw size={16} /> Refresh
            </Button>
          </div>
        </div>

        {role !== "AGENT" && (
          <Card>
            <CardHeader>
              <CardTitle>Not available</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">This map is available for agents only.</CardContent>
          </Card>
        )}

        {role === "AGENT" && (
          <div className="grid gap-5 lg:grid-cols-[1.2fr,0.9fr]">
          <MotionCard className="px-2 pb-2">
            <div className="space-y-4 p-4 pb-2">
              <div className="flex items-center justify-between">
                <SectionTitle className="text-foreground">Route monitor</SectionTitle>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">Live</span>
              </div>
            </div>
            <div className="h-[560px] w-full overflow-hidden rounded-[28px] border border-[hsl(var(--border))]">
              <MapContainer center={center} bounds={bounds} zoom={12} className="h-full w-full">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {polylines.map((line) => (
                  <Polyline key={line.parcelId} positions={line.points} pathOptions={{ color: colorForStatus(line.status), weight: 5 }} />
                ))}
                {markers.map((m) => (
                  <Marker key={`${m.type}:${m.parcelId}:${m.latitude}:${m.longitude}`} position={[m.latitude, m.longitude]} icon={markerIcon}>
                    <Popup>
                      <div className="space-y-1">
                        <div className="font-semibold">{m.trackingNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {m.type.toUpperCase()} · {m.status}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </MotionCard>

          <Card>
            <CardHeader>
              <CardTitle>Route details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3 text-sm text-muted-foreground">Loading…</div>}
              {error && !loading && <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
              {!loading && !error && summary && (
                <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Assigned</p>
                  <p className="text-lg font-semibold text-foreground">{summary.count}</p>
                  <p className="text-sm text-muted-foreground">Active parcels</p>
                </div>
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">In transit</p>
                  <p className="text-lg font-semibold text-foreground">{summary.inTransit}</p>
                  <p className="text-sm text-muted-foreground">Moving now</p>
                </div>
              </div>
              )}

              {!loading && !error && (
                <div className="space-y-3">
                  <SectionTitle className="text-lg">Parcels</SectionTitle>
                  <div className="space-y-2">
                    {parcels.map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-col gap-2 rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{p.trackingNumber}</p>
                            <p className="truncate text-xs text-muted-foreground">{p.pickupAddress} → {p.deliveryAddress}</p>
                          </div>
                          <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {!parcels.length && (
                      <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3 text-sm text-muted-foreground">
                        No active parcels.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}
      </main>
    </div>
  );
}
