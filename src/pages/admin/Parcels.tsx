import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SectionTitle } from "../../components/ui/title";
import { listParcels } from "../../services/parcels";
import type { Parcel } from "../../services/types";
export default function Parcels() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listParcels()
      .then((data) => {
        if (!mounted) return;
        setParcels(data.items);
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Failed to load parcels");
        toast.error("Failed to load parcels");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const toneByStatus: Record<string, string> = {
    "Picked Up": "bg-cyan-100 text-cyan-700",
    "In Transit": "bg-blue-100 text-blue-700",
    Delivered: "bg-emerald-100 text-emerald-700",
    Failed: "bg-rose-100 text-rose-700",
    Delayed: "bg-amber-100 text-amber-700",
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionTitle>Parcels</SectionTitle>
          <p className="text-sm text-muted-foreground">Monitor every parcel with pinned navigation and glass panels.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Import</Button>
          <Button className="gap-2">
            Add parcel <ArrowRight size={16} />
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent parcels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3">
              <p className="text-sm text-muted-foreground">Loading parcels...</p>
            </div>
          )}
          {error && !loading && (
            <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3">
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}
          {!loading && !error && parcels.length === 0 && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3">
              <p className="text-sm text-muted-foreground">No parcels found.</p>
            </div>
          )}
          {!loading &&
            !error &&
            parcels.map((parcel) => (
              <div key={parcel.id} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-foreground">{parcel.id}</p>
                  <p className="text-xs text-muted-foreground">{parcel.customerName ?? ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneByStatus[parcel.status] ?? "bg-slate-200 text-slate-800"}`}>{parcel.status}</span>
                  {parcel.cod !== undefined && <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-foreground">COD {parcel.cod}</span>}
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
