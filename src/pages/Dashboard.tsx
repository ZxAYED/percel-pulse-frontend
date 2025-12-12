import { ArrowRight, MapPin, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { MotionCard } from "../components/ui/motion";
import { PageTitle, SectionTitle } from "../components/ui/title";

export default function Dashboard() {
  const { role } = useAuth();
  const stats = [
    { label: "Bookings today", value: "1,240", helper: "+12% vs yesterday" },
    { label: "On-road parcels", value: "86", helper: "18 live routes" },
    { label: "Delivered", value: "1,152", helper: "96% on-time" },
    { label: "SLA health", value: "98%", helper: "< 1h avg ETA" },
  ];
  const events = [
    { title: "35 parcels dispatched", time: "12:24 PM", color: "bg-emerald-400/70" },
    { title: "Route updated for Gulshan", time: "12:02 PM", color: "bg-cyan-300/70" },
    { title: "5 cash-on-delivery settled", time: "11:40 AM", color: "bg-purple-300/70" },
    { title: "2 delays flagged", time: "11:05 AM", color: "bg-amber-300/80" },
  ];

  return (
    <div className="min-h-screen">
      <main className="w-full space-y-6 px-4 lg:px-10 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[1.8fr,1fr]">
          <MotionCard className="p-0">
            <div className="flex h-full flex-col gap-6 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Realtime control
                </span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles size={16} className="text-primary" />
                  <span>Modern glass UI</span>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-[1.35fr,1fr]">
                <div className="space-y-4">
                  <PageTitle className="text-balance">
                    Welcome back, <span className="text-primary">{role ?? "guest"}</span>
                  </PageTitle>
                  <p className="text-base text-muted-foreground">
                    Keep every parcel on-rail with live visibility, clean typography, and a sleek workspace that stays out of your way.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link to="/admin/parcels">
                      <Button className="gap-2">
                        <Truck size={18} /> Manage parcels
                      </Button>
                    </Link>
                    <Link to="/map">
                      <Button variant="secondary" className="gap-2">
                        <MapPin size={18} /> View live map
                      </Button>
                    </Link>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Fulfillment</span>
                        <span>92%</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/10">
                        <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-primary to-emerald-300" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Live agents</span>
                        <span>24</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/10">
                        <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-cyan-300 to-blue-400" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Customer NPS</span>
                        <span>4.7</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/10">
                        <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-inner">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ShieldCheck size={18} className="text-primary" />
                    Status board
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Next pickup</p>
                        <p className="text-lg font-semibold text-foreground">Mirpur 2</p>
                      </div>
                      <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary-foreground">14:10</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Priority</p>
                        <p className="text-lg font-semibold text-foreground">Cold-chain</p>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-foreground">2 vans</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Cash on delivery</p>
                        <p className="text-lg font-semibold text-foreground">৳ 415,900</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">Settling</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MotionCard>
          <MotionCard className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <SectionTitle className="text-foreground">Today</SectionTitle>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-foreground">Dhaka hub</span>
            </div>
            <p className="text-sm text-muted-foreground">Your operations snapshot stays pinned while you scroll.</p>
            <div className="space-y-3">
              {events.slice(0, 3).map((event) => (
                <div key={event.title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className={`h-10 w-10 rounded-xl ${event.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground" />
                </div>
              ))}
            </div>
          </MotionCard>
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

        <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.map((event) => (
                <div key={event.title} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                  <span className={`mt-1 h-2.5 w-2.5 rounded-full ${event.color}`} />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/assignments" className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Assign an agent</p>
                    <p className="text-xs text-muted-foreground">Balance pickups across the fleet</p>
                  </div>
                  <ArrowRight size={16} className="text-primary" />
                </div>
              </Link>
              <Link to="/admin/reports" className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">View reports</p>
                    <p className="text-xs text-muted-foreground">Performance & cash reconciliation</p>
                  </div>
                  <ArrowRight size={16} className="text-primary" />
                </div>
              </Link>
              <Link to="/map" className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Open live map</p>
                    <p className="text-xs text-muted-foreground">Pinpoint every parcel instantly</p>
                  </div>
                  <MapPin size={16} className="text-primary" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
