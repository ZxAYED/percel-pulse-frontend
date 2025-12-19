import { MapPin, Package } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { MotionCard } from "../../components/ui/motion";
import { Select } from "../../components/ui/select";
import { PageTitle, SectionTitle } from "../../components/ui/title";
import { toastError } from "../../lib/utils";
import { customerDashboardMetrics } from "../../services/reports";
import type { CustomerDashboardMetrics, CustomerDashboardRecentParcel } from "../../services/types";

export default function CustomerDashboard() {
  const [metrics, setMetrics] = useState<CustomerDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [windowSize, setWindowSize] = useState<7 | 14 | 30>(14);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    customerDashboardMetrics()
      .then((data) => {
        if (!mounted) return;
        setMetrics(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setMetrics(null);
        toastError(err, "Failed to load dashboard metrics");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const cards = metrics?.cards;

  const bookingsTrend = useMemo(() => {
    const byDay = metrics?.bookingsByDay ?? {};
    const entries = Object.entries(byDay)
      .map(([date, value]) => ({ date, value: Number(value) }))
      .filter((x) => Number.isFinite(x.value))
      .sort((a, b) => a.date.localeCompare(b.date));
    return entries.slice(-windowSize);
  }, [metrics?.bookingsByDay, windowSize]);

  const recentParcels = metrics?.recentParcels ?? [];
  const activeParcels = useMemo<CustomerDashboardRecentParcel[]>(() => {
    return recentParcels.filter((p) => ["BOOKED", "PICKED_UP", "IN_TRANSIT"].includes(p.status)).slice(0, 5);
  }, [recentParcels]);

  const formatMoney = (n: number | undefined) => (n === undefined ? "—" : `BDT ${new Intl.NumberFormat().format(n)}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageTitle>Customer dashboard</PageTitle>
          <p className="text-sm text-muted-foreground">Book pickups, track parcels live, and review your booking history.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/customer/book">
            <Button className="gap-2">
              <Package size={16} /> Book pickup
            </Button>
          </Link>
          <Link to="/customer/map">
            <Button variant="secondary" className="gap-2">
              <MapPin size={16} /> Live map
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active parcels", value: cards?.activeParcels ?? "—", helper: "In progress" },
          { label: "Delivered", value: cards?.deliveredParcels ?? "—", helper: "Total delivered" },
          { label: "COD pending", value: cards ? formatMoney(cards.codPendingAmount) : "—", helper: "Collect on delivery" },
          { label: "Upcoming pickups", value: cards?.upcomingPickups ?? "—", helper: "Scheduled next" },
        ].map((item) => (
          <Card key={item.label} className="p-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground">{item.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-3xl font-semibold text-foreground">{item.value}</p>
              <p className="text-xs text-emerald-600">{loading ? "Loading…" : item.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <MotionCard className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] px-6 py-5">
          <div>
            <SectionTitle className="text-foreground">Bookings trend</SectionTitle>
            <p className="text-sm text-muted-foreground">Daily bookings for the selected range.</p>
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
        </div>
        <div className="space-y-2 px-6 py-5">
          {bookingsTrend.length === 0 ? (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3 text-sm text-muted-foreground">
              {loading ? "Loading…" : "No trend data."}
            </div>
          ) : (
            bookingsTrend.map((p) => {
              const max = Math.max(...bookingsTrend.map((x) => x.value), 1);
              return (
                <div key={p.date} className="grid grid-cols-[110px,1fr,90px] items-center gap-3 text-sm">
                  <div className="truncate text-muted-foreground">{p.date}</div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-300"
                      style={{ width: `${Math.max(3, Math.round((p.value / max) * 100))}%` }}
                    />
                  </div>
                  <div className="text-right font-semibold text-foreground">{new Intl.NumberFormat().format(p.value)}</div>
                </div>
              );
            })
          )}
        </div>
      </MotionCard>

      <div className="grid gap-5 lg:grid-cols-[1.4fr,1fr]">
        <MotionCard className="p-0">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-5">
            <SectionTitle className="text-foreground">Active parcels</SectionTitle>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">Live</span>
          </div>
          <div className="space-y-3 px-6 py-5">
            {loading && (
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3 text-sm text-muted-foreground">
                Loading parcels…
              </div>
            )}
            {!loading && activeParcels.length === 0 && (
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3 text-sm text-muted-foreground">
                No active parcels.
              </div>
            )}
            {!loading &&
              activeParcels.map((p) => (
                <Link
                  key={p.id}
                  to={`/customer/parcels/${p.id}`}
                  className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm transition hover:bg-secondary"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{p.trackingNumber}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.pickupAddress} → {p.deliveryAddress}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {p.status}
                  </span>
                </Link>
              ))}
          </div>
        </MotionCard>

        <MotionCard className="p-0">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-5">
            <SectionTitle className="text-foreground">History</SectionTitle>
            <Link to="/customer/history" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3 px-6 py-5">
            {loading && (
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3 text-sm text-muted-foreground">
                Loading history…
              </div>
            )}
            {!loading && recentParcels.length === 0 && (
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3 text-sm text-muted-foreground">
                No recent parcels.
              </div>
            )}
            {!loading &&
              recentParcels.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  to={`/customer/parcels/${p.id}`}
                  className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm transition hover:bg-secondary"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{p.trackingNumber}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.pickupAddress} → {p.deliveryAddress}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {p.status}
                  </span>
                </Link>
              ))}
          </div>
        </MotionCard>
      </div>
    </div>
  );
}
