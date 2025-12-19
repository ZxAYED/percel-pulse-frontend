import { MapPin, Phone, Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { MotionCard } from "../../components/ui/motion";
import { Select } from "../../components/ui/select";
import { PageTitle, SectionTitle } from "../../components/ui/title";
import { toastError } from "../../lib/utils";
import { agentDashboardMetrics } from "../../services/reports";
import type { AgentDashboardMetrics, AgentDashboardRecentParcel } from "../../services/types";

export default function AgentOverview() {
  const [metrics, setMetrics] = useState<AgentDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [windowSize, setWindowSize] = useState<7 | 14 | 30>(14);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    agentDashboardMetrics()
      .then((data) => {
        if (!mounted) return;
        setMetrics(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setMetrics(null);
        toastError(err, "Failed to load agent dashboard metrics");
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
  const recent = metrics?.recentParcels ?? [];
  const nextStopParcel = useMemo<AgentDashboardRecentParcel | null>(() => {
    return recent.length ? recent[0] : null;
  }, [recent]);

  const deliveredTrend = useMemo(() => {
    const byDay = metrics?.deliveredByDay ?? {};
    const entries = Object.entries(byDay)
      .map(([date, value]) => ({ date, value: Number(value) }))
      .filter((x) => Number.isFinite(x.value))
      .sort((a, b) => a.date.localeCompare(b.date));
    return entries.slice(-windowSize);
  }, [metrics?.deliveredByDay, windowSize]);

  const formatMoney = (n: number | undefined) => (n === undefined ? "—" : `BDT ${new Intl.NumberFormat().format(n)}`);

  const stats = [
    { label: "Assigned today", value: cards?.assignedToday ?? "—", helper: "New tasks" },
    { label: "Active assigned", value: cards?.activeAssigned ?? "—", helper: "In progress" },
    { label: "Delivered today", value: cards?.deliveredToday ?? "—", helper: "Completed" },
    { label: "COD outstanding", value: cards ? formatMoney(cards.codOutstandingAmount) : "—", helper: "To collect" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageTitle>Agent shift</PageTitle>
          <p className="text-sm text-muted-foreground">Your delivery metrics and recent activity for today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/agent/map">
            <Button size="sm" className="gap-2">
              <MapPin size={16} /> Open route map
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label} className="p-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground">{item.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-semibold text-foreground">{item.value}</p>
              <p className="text-xs text-emerald-600">{loading ? "Loading…" : item.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <MotionCard className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] px-6 py-5">
          <div>
            <SectionTitle className="text-foreground">Delivered trend</SectionTitle>
            <p className="text-sm text-muted-foreground">Daily delivered parcels for the selected range.</p>
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
          {deliveredTrend.length === 0 ? (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3 text-sm text-muted-foreground">
              {loading ? "Loading…" : "No trend data."}
            </div>
          ) : (
            deliveredTrend.map((p) => {
              const max = Math.max(...deliveredTrend.map((x) => x.value), 1);
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

      <MotionCard className="p-0">
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-5">
          <div>
            <SectionTitle className="text-foreground">Most recent parcel</SectionTitle>
            <p className="text-sm text-muted-foreground">Latest parcel from your assigned list.</p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Live</span>
        </div>
        <div className="px-6 py-5">
          <div className="space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-secondary p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-lg font-semibold text-foreground">{nextStopParcel?.trackingNumber ?? "—"}</p>
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {nextStopParcel?.status ?? "—"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{nextStopParcel?.deliveryAddress ?? "No recent parcel"}</p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Timer size={16} className="text-primary" />
              ETA{" "}
              <span className="font-semibold text-foreground">
                {nextStopParcel?.expectedDeliveryAt ?? nextStopParcel?.expectedPickupAt ?? "—"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Phone size={16} className="text-primary" />
              {nextStopParcel?.customer?.phone ?? "—"}
            </div>
            <p className="text-sm text-muted-foreground">{nextStopParcel?.pickupAddress ?? "—"}</p>
          </div>
        </div>
      </MotionCard>
    </div>
  );
}
