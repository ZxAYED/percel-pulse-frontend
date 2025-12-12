import { ArrowRight, MapPin, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { MotionCard } from "../../components/ui/motion";
import { PageTitle, SectionTitle } from "../../components/ui/title";
import { customerBookings } from "../../data/customer";

export default function CustomerDashboard() {
  const active = customerBookings.slice(0, 2);

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
          <Link to="/map">
            <Button variant="secondary" className="gap-2">
              <MapPin size={16} /> Live map
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active bookings", value: active.length, helper: "In progress today" },
          { label: "Delivered", value: 36, helper: "This month" },
          { label: "COD pending", value: "BDT 18,450", helper: "Collect on delivery" },
          { label: "Next pickup", value: "14:10", helper: "Assigned rider" },
        ].map((item) => (
          <Card key={item.label} className="p-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground">{item.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-3xl font-semibold text-foreground">{item.value}</p>
              <p className="text-xs text-emerald-600">{item.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr,1fr]">
        <MotionCard className="p-0">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-5">
            <SectionTitle className="text-foreground">Active parcels</SectionTitle>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">Live</span>
          </div>
          <div className="space-y-3 px-6 py-5">
            {active.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.id}</p>
                  <p className="text-xs text-muted-foreground">{item.pickup} → {item.delivery}</p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </MotionCard>

        <MotionCard className="p-0">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-5">
            <SectionTitle className="text-foreground">History</SectionTitle>
            <Link to="/customer/history" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3 px-6 py-5">
            {customerBookings.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.id}</p>
                  <p className="text-xs text-muted-foreground">{item.pickup} → {item.delivery}</p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </MotionCard>
      </div>
    </div>
  );
}
