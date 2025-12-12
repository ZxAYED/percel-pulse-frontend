import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SectionTitle } from "../../components/ui/title";
import { customerBookings } from "../../data/customer";

export default function CustomerHistory() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionTitle>Booking history & status</SectionTitle>
          <p className="text-sm text-muted-foreground">All parcels you booked with live statuses.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Parcels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {customerBookings.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.id}</p>
                <p className="text-xs text-muted-foreground">
                  {item.pickup} → {item.delivery} • {item.size} • {item.payment}
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {item.status}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
