import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SectionTitle } from "../../components/ui/title";
import { getCustomerParcel, trackCustomerParcel } from "../../services/parcels";
import type { CustomerParcelDetails, TrackingPoint } from "../../services/types";

const DEFAULT_CENTER: LatLngTuple = [23.8103, 90.4125];

type ParcelDetailsWithCoords = CustomerParcelDetails & {
  pickupLat?: number | null;
  pickupLng?: number | null;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
};

const statusTone = (value?: string | null) => {
  if (!value) return "bg-muted text-foreground/80 border border-transparent";
  const key = value.toLowerCase();
  if (key.includes("book")) return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  if (key.includes("pend")) return "bg-amber-100 text-amber-700 border border-amber-200";
  if (key.includes("deliver")) return "bg-sky-100 text-sky-700 border border-sky-200";
  if (key.includes("transit")) return "bg-indigo-100 text-indigo-700 border border-indigo-200";
  if (key.includes("fail")) return "bg-rose-100 text-rose-700 border border-rose-200";
  return "bg-muted text-foreground/80 border border-transparent";
};

export default function CustomerParcelDetails() {
  const { parcelId } = useParams<{ parcelId?: string }>();
  const [parcel, setParcel] = useState<ParcelDetailsWithCoords | null>(null);
  const [routePoints, setRoutePoints] = useState<TrackingPoint[]>([]);
  const [agentLocation, setAgentLocation] = useState<LatLngTuple | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!parcelId) {
      setParcel(null);
      setRoutePoints([]);
      setAgentLocation(null);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);
    Promise.all([getCustomerParcel(parcelId), trackCustomerParcel(parcelId)])
      .then(([details, track]) => {
        if (!mounted) return;
        setParcel(details as ParcelDetailsWithCoords);
        setRoutePoints(track.points ?? []);
        setAgentLocation(null);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        const maybeAxios = err as { response?: { data?: { message?: string } }; message?: string };
        setError(maybeAxios?.response?.data?.message ?? maybeAxios?.message ?? "Unable to load parcel details.");
        setParcel(null);
        setRoutePoints([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [parcelId]);

  const mapRoute = useMemo<LatLngTuple[]>(() => {
    const pts: LatLngTuple[] = [];
    for (const point of routePoints) {
      if (Number.isFinite(point.latitude) && Number.isFinite(point.longitude)) {
        pts.push([point.latitude, point.longitude]);
      }
    }
    return pts;
  }, [routePoints]);

  const pickupPos = useMemo<LatLngTuple | null>(() => {
    if (parcel?.pickupLat && parcel?.pickupLng) return [parcel.pickupLat, parcel.pickupLng];
    return mapRoute.length ? mapRoute[0] : null;
  }, [mapRoute, parcel?.pickupLat, parcel?.pickupLng]);

  const deliveryPos = useMemo<LatLngTuple | null>(() => {
    if (parcel?.deliveryLat && parcel?.deliveryLng) return [parcel.deliveryLat, parcel.deliveryLng];
    return mapRoute.length ? mapRoute[mapRoute.length - 1] : null;
  }, [mapRoute, parcel?.deliveryLat, parcel?.deliveryLng]);

  const bounds = useMemo<LatLngBoundsExpression | undefined>(() => {
    if (mapRoute.length >= 2) return mapRoute;
    if (pickupPos && deliveryPos) return [pickupPos, deliveryPos];
    return undefined;
  }, [deliveryPos, mapRoute, pickupPos]);

  const mapCenter = pickupPos ?? mapRoute[0] ?? DEFAULT_CENTER;

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  const refreshAgentLocation = () => {
    if (mapRoute.length) {
      setAgentLocation(mapRoute[mapRoute.length - 1]);
      return;
    }
    if (pickupPos) {
      setAgentLocation(pickupPos);
    }
  };

  const renderStatusHistory = () => {
    if (!parcel?.statusHistory?.length) return <p className="text-sm text-muted-foreground">No history yet.</p>;
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] text-sm">
          <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Remarks</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]/70">
            {parcel.statusHistory.map((entry) => (
              <tr key={`${entry.status}-${entry.createdAt}`} className="bg-white">
                <td className="px-4 py-3">
                  <Badge className={statusTone(entry.status)}>{entry.status}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{entry.remarks ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {entry.updatedBy.name} 
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{formatDateTime(entry.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionTitle>Parcel details</SectionTitle>
          <p className="text-sm text-muted-foreground">
            Review parcel metadata, timeline, and live route. Use the agent tracker once available to follow handoffs.
          </p>
        </div>
        <Link to="/customer/history" className="text-sm font-semibold text-primary underline-offset-2 hover:underline">
          ← Back to history
        </Link>
      </div>

      {!parcelId && !loading && (
        <Card>
          <CardHeader>
            <CardTitle>Select a parcel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Choose a parcel from the history table to load detailed tracking, payment, and map directions.</p>
            <p>The map preview will appear here with pickup and delivery pins.</p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">Loading parcel details…</CardContent>
        </Card>
      )}

      {error && !loading && (
        <Card>
          <CardContent className="py-6 text-sm text-rose-700">{error}</CardContent>
        </Card>
      )}

      {!loading && parcel && (
        <>
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-primary/10 via-emerald-50 to-white">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="text-xl">{parcel.trackingNumber}</CardTitle>
                <Badge className={statusTone(parcel.status)}>{parcel.status}</Badge>
                <Badge className={statusTone(parcel.paymentStatus)}>{parcel.paymentStatus}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {parcel.pickupAddress} → {parcel.deliveryAddress}
              </p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Pickup</p>
                  <p className="text-sm font-semibold text-foreground">{formatDateTime(parcel.expectedPickupAt)}</p>
                  <p className="text-xs text-muted-foreground">{parcel.pickupAddress}</p>
                </div>
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Delivery</p>
                  <p className="text-sm font-semibold text-foreground">{formatDateTime(parcel.expectedDeliveryAt)}</p>
                  <p className="text-xs text-muted-foreground">{parcel.deliveryAddress}</p>
                </div>
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Payment</p>
                  <p className="text-sm font-semibold text-foreground">
                    {parcel.paymentType} {parcel.paymentType === "COD" && parcel.codAmount ? `• BDT ${parcel.codAmount}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">Status: {parcel.paymentStatus}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-white p-4 text-sm">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Agent</p>
                  <p className="font-semibold text-foreground">
                    {parcel.agentAssignment?.agent.name ?? "Not assigned"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {parcel.agentAssignment?.agent.email ?? "---"} · {parcel.agentAssignment?.agent.phone ?? "N/A"}
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={refreshAgentLocation}>
                  Refresh agent location
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Route map</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[420px] w-full">
                  <MapContainer center={mapCenter} bounds={bounds} zoom={12} className="h-full w-full">
                    <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {mapRoute.length >= 2 && <Polyline positions={mapRoute} pathOptions={{ color: "#10b981", weight: 5 }} />}
                    {pickupPos && (
                      <Marker position={pickupPos}>
                        <Popup>Pickup: {parcel.pickupAddress}</Popup>
                      </Marker>
                    )}
                    {deliveryPos && (
                      <Marker position={deliveryPos}>
                        <Popup>Delivery: {parcel.deliveryAddress}</Popup>
                      </Marker>
                    )}
                    {agentLocation && (
                      <Marker position={agentLocation}>
                        <Popup>Last agent ping</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
                <div className="space-y-1 px-6 py-4 text-sm text-muted-foreground">
                  <p>
                    Route points: <span className="font-semibold text-foreground">{mapRoute.length}</span>
                  </p>
                  <p>
                    Agent location:{" "}
                    {agentLocation ? `${agentLocation[0].toFixed(4)}, ${agentLocation[1].toFixed(4)}` : "Tap refresh to fetch"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status history</CardTitle>
              </CardHeader>
              <CardContent>{renderStatusHistory()}</CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
