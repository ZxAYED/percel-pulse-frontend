import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { MotionCard } from "../../components/ui/motion";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Select } from "../../components/ui/select";
import { PageTitle } from "../../components/ui/title";
import { toastError } from "../../lib/utils";
import { adminDashboardMetrics } from "../../services/reports";
import type { AdminDashboardMetrics, AdminDashboardTotals } from "../../services/types";

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
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [windowSize, setWindowSize] = useState<7 | 14 | 30>(14);

  useEffect(() => {
    let mounted = true;
    setMetricsLoading(true);
    adminDashboardMetrics()
      .then((data) => {
        if (!mounted) return;
        setMetrics(data);
      })
      .catch((err) => {
        if (!mounted) return;
        toastError(err, "Failed to load admin dashboard metrics");
        setMetrics(null);
      })
      .finally(() => {
        if (!mounted) return;
        setMetricsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const totals: AdminDashboardTotals = metrics?.totals ?? {};

  const metricCards = useMemo(() => {
    const getNumber = (...keys: string[]) => {
      for (const key of keys) {
        const value = totals[key];
        if (typeof value === "number" && Number.isFinite(value)) return value;
        if (typeof value === "string") {
          const parsed = Number(value);
          if (Number.isFinite(parsed)) return parsed;
        }
      }
      return null;
    };

    const bookingsToday = getNumber("bookingsToday", "bookings", "todayBookings", "totalBookingsToday");
    const failed = getNumber("failedDeliveries", "failed", "todayFailed", "totalFailedToday");
    const cod = getNumber("codAmount", "cod", "todayCod", "totalCodToday");
    const onRoad = getNumber("onRoadParcels", "onRoad", "onRoadCount", "activeParcels");

    const formatCount = (value: number | null) => (value === null ? "—" : new Intl.NumberFormat().format(value));
    const formatCurrency = (value: number | null) => (value === null ? "—" : `BDT ${new Intl.NumberFormat().format(value)}`);

    return [
      { label: "Bookings today", value: formatCount(bookingsToday) },
      { label: "Failed deliveries", value: formatCount(failed) },
      { label: "COD amount", value: formatCurrency(cod) },
      { label: "On-road parcels", value: formatCount(onRoad) },
    ].map((item) => ({
      ...item,
      helper: metricsLoading ? "Loading…" : "Updated just now",
    }));
  }, [metricsLoading, totals]);

  type TrendPoint = { label: string; value: number };
  const normalizeSeries = (input: unknown, preferredValueKeys: string[]): TrendPoint[] => {
    if (input && typeof input === "object" && !Array.isArray(input)) {
      const entries = Object.entries(input as Record<string, unknown>)
        .map(([label, value]) => ({ label, value: Number(value) }))
        .filter((x) => Number.isFinite(x.value))
        .sort((a, b) => a.label.localeCompare(b.label));
      return entries;
    }
    if (!Array.isArray(input)) return [];
    const labelKeys = ["date", "day", "label", "x", "_id", "name"];
    const valueKeys = [...preferredValueKeys, "value", "count", "total", "amount", "sum"];

    const points: TrendPoint[] = [];
    for (let i = 0; i < input.length; i++) {
      const row = input[i] as unknown;
      if (typeof row === "number") {
        points.push({ label: String(i + 1), value: row });
        continue;
      }
      if (Array.isArray(row)) {
        const label = row[0] != null ? String(row[0]) : String(i + 1);
        const v = row[1];
        const value = typeof v === "number" ? v : Number(v);
        if (Number.isFinite(value)) points.push({ label, value });
        continue;
      }
      if (row && typeof row === "object") {
        const obj = row as Record<string, unknown>;
        const labelKey = labelKeys.find((k) => obj[k] !== undefined && obj[k] !== null);
        const label = labelKey ? String(obj[labelKey]) : String(i + 1);
        let value: number | null = null;
        for (const k of valueKeys) {
          const v = obj[k];
          if (typeof v === "number" && Number.isFinite(v)) {
            value = v;
            break;
          }
          if (typeof v === "string") {
            const parsed = Number(v);
            if (Number.isFinite(parsed)) {
              value = parsed;
              break;
            }
          }
        }
        if (value === null) {
          for (const v of Object.values(obj)) {
            if (typeof v === "number" && Number.isFinite(v)) {
              value = v;
              break;
            }
            if (typeof v === "string") {
              const parsed = Number(v);
              if (Number.isFinite(parsed)) {
                value = parsed;
                break;
              }
            }
          }
        }
        if (value !== null) points.push({ label, value });
      }
    }
    return points;
  };

  const bookingsTrend = useMemo(() => {
    const pts = normalizeSeries(metrics?.bookingsByDay ?? {}, ["bookings", "booking", "bookingsCount"]);
    return pts.slice(-windowSize);
  }, [metrics?.bookingsByDay, windowSize]);

  const failedTrend = useMemo(() => {
    const pts = normalizeSeries(metrics?.failedByDay ?? {}, ["failed", "failedDeliveries", "failedCount"]);
    return pts.slice(-windowSize);
  }, [metrics?.failedByDay, windowSize]);

  const codTrend = useMemo(() => {
    const pts = normalizeSeries(metrics?.codByDay ?? {}, ["cod", "codAmount", "amount"]);
    return pts.slice(-windowSize);
  }, [metrics?.codByDay, windowSize]);

  const renderTrend = (points: TrendPoint[], format: "count" | "currency") => {
    const max = points.reduce((acc, p) => Math.max(acc, p.value), 0) || 1;
    const fmt = new Intl.NumberFormat();
    return (
      <div className="space-y-2">
        {points.length === 0 ? (
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3 text-sm text-muted-foreground">
            {metricsLoading ? "Loading…" : "No trend data."}
          </div>
        ) : (
          points.map((p) => (
            <div key={p.label} className="grid grid-cols-[110px,1fr,120px] items-center gap-3 text-sm">
              <div className="truncate text-muted-foreground">{p.label}</div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-300"
                  style={{ width: `${Math.max(3, Math.round((p.value / max) * 100))}%` }}
                />
              </div>
              <div className="text-right font-semibold text-foreground">
                {format === "currency" ? `BDT ${fmt.format(p.value)}` : fmt.format(p.value)}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const totalsEntries = useMemo(() => {
    const entries = Object.entries(totals)
      .filter(([_, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));
    return entries;
  }, [totals]);




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
        {metricCards.map((item) => (
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
          <CardHeader className="flex flex-col gap-3 border-b border-[hsl(var(--border))] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">Trends</CardTitle>
              <p className="text-sm text-muted-foreground">Bookings, failed deliveries, and COD over time.</p>
            </div>
            <div className="w-44">
              <Select
                value={String(windowSize)}
                onChange={(v) => setWindowSize(Number(v) as 7 | 14 | 30)}
                options={[
                  { label: "Last 7 days", value: "7" },
                  { label: "Last 14 days", value: "14" },
                  { label: "Last 30 days", value: "30" },
                ]}
              />
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 px-6 py-5 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-foreground">Bookings</div>
              {renderTrend(bookingsTrend, "count")}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-foreground">Failed</div>
              {renderTrend(failedTrend, "count")}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-foreground">COD</div>
              {renderTrend(codTrend, "currency")}
            </div>
          </CardContent>
        </MotionCard>

        <MotionCard className="p-0">
          <CardHeader className="flex flex-col gap-2 border-b border-[hsl(var(--border))] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">Totals</CardTitle>
              <p className="text-sm text-muted-foreground">All totals returned by the backend.</p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary" size="sm">
                  View raw
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[420px]">
                <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap break-words text-xs text-foreground">
                  {JSON.stringify(totals, null, 2)}
                </pre>
              </PopoverContent>
            </Popover>
          </CardHeader>
          <CardContent className="space-y-2 px-6 py-5">
            {totalsEntries.length === 0 ? (
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3 text-sm text-muted-foreground">
                {metricsLoading ? "Loading…" : "No totals received."}
              </div>
            ) : (
              totalsEntries.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 text-sm shadow-sm">
                  <div className="max-w-[60%] truncate text-muted-foreground">{k}</div>
                  <div className="text-right font-semibold text-foreground">{v === null ? "null" : String(v)}</div>
                </div>
              ))
            )}
          </CardContent>
        </MotionCard>
      </div>

      {/* <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
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
      </div> */}

      {/* <div className="grid gap-4 lg:grid-cols-[1.3fr,1fr]">
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
      </div> */}
{/* 
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
      </div> */}
    </div>
  );
}
