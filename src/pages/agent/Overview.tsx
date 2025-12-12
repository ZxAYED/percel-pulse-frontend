import { ArrowRight, BadgeCheck, MapPin, Phone, Timer, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { MotionCard } from "../../components/ui/motion";
import { PageTitle, SectionTitle } from "../../components/ui/title";

export default function AgentOverview() {
  const stats = [
    { label: "Stops today", value: "12", helper: "3 completed" },
    { label: "Parcels left", value: "18", helper: "Next hub: Banani" },
    { label: "On-time", value: "96%", helper: "ETA under 10m" },
    { label: "Cash to collect", value: "? 18,450", helper: "5 COD drops" },
  ];

  const nextStop = {
    name: "Lotus Tower, Banani",
    eta: "14:20",
    contact: "+880 1711-223344",
    note: "Fragile | 3 parcels",
  };

  const timeline = [
    { title: "Pickup confirmed", time: "12:45 PM", tone: "bg-emerald-100 text-emerald-700" },
    { title: "Route optimized", time: "12:30 PM", tone: "bg-cyan-100 text-cyan-700" },
    { title: "Break logged", time: "12:10 PM", tone: "bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageTitle>Agent shift</PageTitle>
          <p className="text-sm text-muted-foreground">Your live route, COD, and tasks grouped for today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" className="gap-2">
            <Truck size={16} /> Start shift
          </Button>
          <Link to="/map">
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
              <p className="text-xs text-emerald-600">{item.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <MotionCard className="p-0">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-5">
            <div>
              <SectionTitle className="text-foreground">Next stop</SectionTitle>
              <p className="text-sm text-muted-foreground">Preview address and COD before you arrive.</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Live</span>
          </div>
          <div className="grid gap-4 px-6 py-5 md:grid-cols-[1.2fr,1fr]">
            <div className="space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-secondary p-4">
              <p className="text-lg font-semibold text-foreground">{nextStop.name}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Timer size={16} className="text-primary" />
                ETA <span className="font-semibold text-foreground">{nextStop.eta}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone size={16} className="text-primary" />
                {nextStop.contact}
              </div>
              <p className="text-sm text-muted-foreground">{nextStop.note}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="gap-2">
                  <BadgeCheck size={16} /> Arrived
                </Button>
                <Button size="sm" variant="secondary" className="gap-2">
                  <ArrowRight size={16} /> Navigate
                </Button>
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-secondary p-4">
              <SectionTitle className="text-base">Parcel checklist</SectionTitle>
              {[
                { label: "Scan label", status: "Pending" },
                { label: "Collect COD", status: "Due" },
                { label: "Capture signature", status: "Pending" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
                  <span className="text-sm font-semibold text-foreground">{item.label}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </MotionCard>

        <MotionCard className="p-0">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-5">
            <SectionTitle className="text-foreground">Shift feed</SectionTitle>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">Auto updates</span>
          </div>
          <div className="space-y-3 px-6 py-5">
            {timeline.map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${item.tone}`}>Live</span>
              </div>
            ))}
          </div>
        </MotionCard>
      </div>
    </div>
  );
}
