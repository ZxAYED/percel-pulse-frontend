import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, RefreshCw, Save, Shuffle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { MotionCard } from "../components/ui/motion";
import { PageTitle, SectionTitle } from "../components/ui/title";
import { useAuth } from "../hooks/useAuth";
import { adminRoutePlan, agentRoutePlan, customerRoutePlan, type LatLngTuple } from "../data/routes";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

export default function TrackMap() {
  const { role } = useAuth();
  const [startId, setStartId] = useState(agentRoutePlan.startOptions[0].id);
  const routePlan = useMemo(() => {
    if (role === "agent") return agentRoutePlan;
    if (role === "customer") return customerRoutePlan;
    return adminRoutePlan;
  }, [role]);

  const resolvedStart: LatLngTuple = useMemo(() => {
    if ("start" in routePlan) return routePlan.start;
    const found = routePlan.startOptions.find((opt) => opt.id === startId) || routePlan.startOptions[0];
    return found.coords;
  }, [routePlan, startId]);

  const [center, setCenter] = useState<LatLngTuple>(resolvedStart);
  const [route, setRoute] = useState<LatLngTuple[]>([resolvedStart, ...("waypoints" in routePlan ? routePlan.waypoints : [])]);
  const [customerPickup, setCustomerPickup] = useState("");
  const [customerDelivery, setCustomerDelivery] = useState("");

  useEffect(() => {
    const stops = "waypoints" in routePlan ? routePlan.waypoints : [];
    setCenter(resolvedStart);
    setRoute([resolvedStart, ...stops]);
  }, [resolvedStart, routePlan]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: LatLngTuple = [pos.coords.latitude, pos.coords.longitude];
        if (role === "agent") return; // keep fixed depot unless rider changes it
        setCenter(coords);
      },
      () => {}
    );
  }, [role]);

  const saveAgentRoute = () => {
    if (role !== "agent") return;
    const startLabel = "startOptions" in routePlan ? routePlan.startOptions.find((s) => s.id === startId)?.label : "Start";
    console.log("Agent route saved", { start: startLabel, coordinates: route });
    alert("Agent route saved (check console)");
  };

  const submitCustomerLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "customer") {
      console.log("Customer shared location", { pickup: customerPickup, delivery: customerDelivery });
      alert("Location shared (check console)");
    }
  };

  const title = role === "agent" ? "Agent delivery route" : role === "customer" ? "Customer route" : "Operations route";
  const subtitle =
    role === "agent"
      ? "Fixed depot start; rider can pick a hub and follow optimized stops. (Leaflet preview without Google Directions)"
      : role === "customer"
        ? "Share your pickup/delivery path; agents use this to plan handoff. (Leaflet preview without Google Directions)"
        : "Live operational route overview. (Leaflet preview without Google Directions)";

  return (
    <div className="min-h-screen">
      <main className="w-full space-y-6 px-4 lg:px-10 lg:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <PageTitle>{title}</PageTitle>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setCenter(resolvedStart)} className="gap-2">
              <RefreshCw size={16} /> Reset center
            </Button>
            <Button variant="secondary" onClick={() => setRoute([...route].reverse())} className="gap-2">
              <Shuffle size={16} /> Reverse route
            </Button>
            {role === "agent" && (
              <Button onClick={saveAgentRoute} className="gap-2">
                <Save size={16} /> Save route
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr,0.9fr]">
          <MotionCard className="p-0">
            <div className="space-y-4 p-4 pb-2">
              <div className="flex items-center justify-between">
                <SectionTitle className="text-foreground">Route monitor</SectionTitle>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  Optimized via Google Maps
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
                  <MapPin size={14} className="text-primary" /> {center[0].toFixed(4)}, {center[1].toFixed(4)}
                </span>
                <span className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
                  <MapPin size={14} className="text-cyan-600" /> {route.length} waypoints
                </span>
                {role === "agent" && "startOptions" in routePlan && (
                  <select
                    value={startId}
                    onChange={(e) => setStartId(e.target.value)}
                    className="rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm text-foreground shadow-sm"
                  >
                    {routePlan.startOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        Start: {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <div className="h-[560px] w-full overflow-hidden rounded-[28px] border border-[hsl(var(--border))]">
              <MapContainer center={center} zoom={12} className="h-full w-full">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={center} icon={markerIcon}>
                  <Popup>Start point</Popup>
                </Marker>
                <Polyline positions={route} color="#22c55e" weight={5} />
                {route.map((pt, i) => (
                  <Marker key={`${pt[0]}-${pt[1]}-${i}`} position={pt} icon={markerIcon}>
                    <Popup>{i === 0 ? "Start" : `Stop ${i}`}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </MotionCard>

          <Card>
            <CardHeader>
              <CardTitle>Route details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Start</p>
                  <p className="text-lg font-semibold text-foreground">{center[0].toFixed(4)}</p>
                  <p className="text-sm text-muted-foreground">{center[1].toFixed(4)}</p>
                </div>
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Route length</p>
                  <p className="text-lg font-semibold text-foreground">{route.length} points</p>
                  <p className="text-sm text-muted-foreground">Polyline weight: 5px</p>
                </div>
              </div>
              <div className="space-y-3">
                <SectionTitle className="text-lg">Stops</SectionTitle>
                <div className="space-y-2">
                  {route.map((pt, idx) => (
                    <div key={`${pt[0]}-${pt[1]}-${idx}`} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{idx === 0 ? "Start" : `Waypoint ${idx}`}</p>
                        <p className="text-xs text-muted-foreground">
                          {pt[0].toFixed(4)}, {pt[1].toFixed(4)}
                        </p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-foreground">
                        ETA {20 + idx} min
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {role === "customer" && (
                <form className="space-y-3" onSubmit={submitCustomerLocation}>
                  <SectionTitle className="text-lg">Share your locations</SectionTitle>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground" htmlFor="customer-pickup">Pickup address</label>
                    <input
                      id="customer-pickup"
                      className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm text-foreground shadow-sm"
                      value={customerPickup}
                      onChange={(e) => setCustomerPickup(e.target.value)}
                      placeholder="House 12, Dhanmondi"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground" htmlFor="customer-delivery">Delivery address</label>
                    <input
                      id="customer-delivery"
                      className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm text-foreground shadow-sm"
                      value={customerDelivery}
                      onChange={(e) => setCustomerDelivery(e.target.value)}
                      placeholder="Road 18, Banani"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Share location</Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
