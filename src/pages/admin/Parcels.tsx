import { ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SectionTitle } from "../../components/ui/title";
import { adminParcels } from "../../data/admin";
export default function Parcels() {
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
          {adminParcels.map((parcel) => (
            <div key={parcel.id} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-foreground">{parcel.id}</p>
                <p className="text-xs text-muted-foreground">Lane: {parcel.lane}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${parcel.tone}`}>{parcel.status}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-foreground">ETA {parcel.eta}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
