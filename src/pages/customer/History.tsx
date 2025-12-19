import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SectionTitle } from "../../components/ui/title";
import { listCustomerParcels } from "../../services/parcels";
import type { CustomerParcelListItem, CustomerParcelsMeta } from "../../services/types";

const PAGE_SIZE = 8;

export default function CustomerHistory() {
  const [parcels, setParcels] = useState<CustomerParcelListItem[]>([]);
  const [meta, setMeta] = useState<CustomerParcelsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    listCustomerParcels({ page, limit: PAGE_SIZE, sortBy: "createdAt", sortOrder: "desc" })
      .then((res) => {
        if (!mounted) return;
        setParcels(res.data ?? []);
        setMeta(res.meta ?? null);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        const maybeAxios = err as { response?: { data?: { message?: string } }; message?: string };
        setError(maybeAxios?.response?.data?.message ?? maybeAxios?.message ?? "Failed to load parcels.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [page]);

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  const pillClass = (label?: string | null) => {
    const fallback = "bg-muted text-foreground/80 border border-transparent";
    if (!label) return fallback;
    const key = label.toLowerCase();
    if (key.includes("book")) return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    if (key.includes("pend")) return "bg-amber-100 text-amber-700 border border-amber-200";
    if (key.includes("deliver")) return "bg-sky-100 text-sky-700 border border-sky-200";
    if (key.includes("transit")) return "bg-indigo-100 text-indigo-700 border border-indigo-200";
    if (key.includes("fail")) return "bg-rose-100 text-rose-700 border border-rose-200";
    return fallback;
  };

  const canPrev = page > 1;
  const totalPages = meta?.totalPages ?? page;
  const canNext = page < totalPages;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionTitle>Booking history</SectionTitle>
          <p className="text-sm text-muted-foreground">Monitor every parcel you booked and jump into route details in one click.</p>
        </div>
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-2 text-xs text-muted-foreground">
          Showing page {page} of {totalPages}
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-secondary/60">
          <CardTitle>Parcels</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="border-b border-[hsl(var(--border))]/70 px-6 py-5 text-sm text-muted-foreground">Loading parcels…</div>
          )}
          {error && !loading && (
            <div className="border-b border-rose-200 bg-rose-50/70 px-6 py-5 text-sm text-rose-700">{error}</div>
          )}
          {!loading && !error && parcels.length === 0 && (
            <div className="border-b border-[hsl(var(--border))]/70 px-6 py-5 text-sm text-muted-foreground">No parcels found.</div>
          )}

          {!loading && !error && parcels.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-white text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 text-left">Tracking</th>
                    <th className="px-6 py-4 text-left">Route</th>
                    <th className="px-6 py-4 text-left">Parcel Size</th>
                    <th className="px-6 py-4 text-left">Payment</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]/70 bg-white">
                  {parcels.map((item) => (
                    <tr key={item.id} className="transition hover:bg-primary/5">
                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-foreground">{item.trackingNumber}</div>
                        <p className="text-xs text-muted-foreground mt-1">Created {formatDateTime(item.createdAt)}</p>
                      </td>
                      <td className="px-6 py-4 align-top text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">{item.pickupAddress}</p>
                        <p className="font-medium text-foreground">→ {item.deliveryAddress}</p>
                      </td>
                      <td className="px-6 py-4 align-top text-xs text-muted-foreground">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="rounded-full bg-secondary/60 text-foreground">
                            {item.parcelSize}
                          </Badge>
                         
                        </div>
                        {typeof item.weightKg === "number" && (
                          <p className="mt-1">Weight: {item.weightKg.toFixed(1)} kg</p>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top text-xs text-muted-foreground">
                        
                      
                        <p className="">
                          <Badge className={pillClass(item.paymentStatus)}>{item.paymentStatus}</Badge>
                        </p>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <Badge className={pillClass(item.status)}>{item.status}</Badge>
                        {item.agentAssignment && (
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Agent: {item.agentAssignment.agent.name}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/customer/parcels/${item.id}`}
                          className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
                        >
                          View details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        <div className="flex items-center justify-between border-t border-[hsl(var(--border))]/70 bg-secondary/60 px-6 py-3 text-sm text-muted-foreground">
          <span>
            Page {page} / {totalPages} • Total {meta?.total ?? parcels.length}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={!canPrev} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={!canNext} onClick={() => setPage((prev) => prev + 1)}>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
