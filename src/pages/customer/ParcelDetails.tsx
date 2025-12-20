import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ParcelTrackingMap } from "../../components/maps/ParcelTrackingMap";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SectionTitle } from "../../components/ui/title";
import { useAuth } from "../../hooks/useAuth";
import { getCustomerParcel, trackCustomerParcel, trackCustomerParcelCurrent } from "../../services/parcels";
import type { CustomerParcelDetails, TrackingPoint } from "../../services/types";
import { createWsClient } from "../../services/ws";

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
  const { token } = useAuth();
  const [parcel, setParcel] = useState<ParcelDetailsWithCoords | null>(null);
  const [routePoints, setRoutePoints] = useState<TrackingPoint[]>([]);
  const [agentLocation, setAgentLocation] = useState<LatLngTuple | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<ReturnType<typeof createWsClient> | null>(null);

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
    Promise.all([getCustomerParcel(parcelId), trackCustomerParcel(parcelId), trackCustomerParcelCurrent(parcelId)])
      .then(([details, track, current]) => {
        if (!mounted) return;
        setParcel(details as ParcelDetailsWithCoords);
        setRoutePoints(track.points ?? []);
        const pt = current.point;
        if (pt && Number.isFinite(pt.latitude) && Number.isFinite(pt.longitude)) setAgentLocation([pt.latitude, pt.longitude]);
        else setAgentLocation(null);
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

  useEffect(() => {
    if (!parcelId || !token) return;
    const client = createWsClient({
      token,
      onMessage: (msg) => {
        if (msg.type !== "parcel_location") return;
        const m = msg as any;
        if (String(m.parcelId ?? "") !== parcelId) return;
        const lat = Number(m.latitude);
        const lng = Number(m.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        const point: TrackingPoint = {
          latitude: lat,
          longitude: lng,
          speedKph: Number.isFinite(Number(m.speedKph)) ? Number(m.speedKph) : 0,
          heading: Number.isFinite(Number(m.heading)) ? Number(m.heading) : 0,
          recordedAt: typeof m.recordedAt === "string" ? m.recordedAt : new Date().toISOString(),
        };
        setAgentLocation([lat, lng]);
        setRoutePoints((prev) => {
          const next = [...prev, point];
          return next.length > 100 ? next.slice(next.length - 100) : next;
        });
      },
    });
    wsRef.current = client;
    client.connect();
    client.joinParcel(parcelId);
    return () => {
      client.close();
      if (wsRef.current === client) wsRef.current = null;
    };
  }, [parcelId, token]);

  const validRouteTuples = useMemo<LatLngTuple[]>(() => {
    const pts: LatLngTuple[] = [];
    for (const point of routePoints) {
      if (Number.isFinite(point.latitude) && Number.isFinite(point.longitude)) {
        pts.push([point.latitude, point.longitude]);
      }
    }
    return pts;
  }, [routePoints]);

  const pickupCoords = useMemo(() => {
    const lat = parcel?.pickupLat;
    const lng = parcel?.pickupLng;
    if (typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    const first = validRouteTuples[0];
    return first ? { lat: first[0], lng: first[1] } : null;
  }, [parcel?.pickupLat, parcel?.pickupLng, validRouteTuples]);

  const deliveryCoords = useMemo(() => {
    const lat = parcel?.deliveryLat;
    const lng = parcel?.deliveryLng;
    if (typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    const last = validRouteTuples[validRouteTuples.length - 1];
    return last ? { lat: last[0], lng: last[1] } : null;
  }, [parcel?.deliveryLat, parcel?.deliveryLng, validRouteTuples]);

  const agentCoords = useMemo(() => {
    if (!agentLocation) return null;
    return { lat: agentLocation[0], lng: agentLocation[1] };
  }, [agentLocation]);

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  const formatLatLng = (lat?: number | null, lng?: number | null) => {
    if (typeof lat !== "number" || typeof lng !== "number") return "-";
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "-";
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const refreshAgentLocation = async () => {
    if (!parcelId) return;
    try {
      const res = await trackCustomerParcelCurrent(parcelId);
      const pt = res.point;
      if (pt && Number.isFinite(pt.latitude) && Number.isFinite(pt.longitude)) {
        setAgentLocation([pt.latitude, pt.longitude]);
        return;
      }
    } catch {
    }
    if (validRouteTuples.length) {
      setAgentLocation(validRouteTuples[validRouteTuples.length - 1]);
      return;
    }
    if (pickupCoords) setAgentLocation([pickupCoords.lat, pickupCoords.lng]);
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
              <th className="px-4 py-2 text-left">Updated by</th>
              <th className="px-4 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]/70">
            {parcel.statusHistory.map((entry) => (
              <tr key={`${entry.status}-${entry.createdAt}`} className="bg-white">
                <td className="px-4 py-3">
                  <Badge className={statusTone(entry.status)}>{entry.status}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{entry.remarks ?? "-"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {entry.updatedBy.name} - {entry.updatedBy.role} - {entry.updatedBy.id}
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
          - Back to history
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
          <CardContent className="py-10 text-center text-sm text-muted-foreground">Loading parcel details...</CardContent>
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
                {parcel.pickupAddress} - {parcel.deliveryAddress}
              </p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Pickup</p>
                  <p className="text-sm font-semibold text-foreground">{formatDateTime(parcel.expectedPickupAt)}</p>
                  <p className="text-xs text-muted-foreground">{parcel.pickupAddress}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Coords: {formatLatLng(parcel.pickupLat, parcel.pickupLng)}</p>
                </div>
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Delivery</p>
                  <p className="text-sm font-semibold text-foreground">{formatDateTime(parcel.expectedDeliveryAt)}</p>
                  <p className="text-xs text-muted-foreground">{parcel.deliveryAddress}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Coords: {formatLatLng(parcel.deliveryLat, parcel.deliveryLng)}</p>
                </div>
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Payment</p>
                  <p className="text-sm font-semibold text-foreground">
                    {parcel.paymentType} {parcel.paymentType === "COD" && parcel.codAmount ? `- BDT ${parcel.codAmount}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">Status: {parcel.paymentStatus}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Metadata</p>
                  <p className="text-sm font-semibold text-foreground">Reference: {parcel.referenceCode ?? "-"}</p>
                  <p className="text-xs text-muted-foreground">Parcel ID: {parcel.id}</p>
                  <p className="text-xs text-muted-foreground">Customer ID: {parcel.customerId}</p>
                </div>
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Package</p>
                  <p className="text-sm font-semibold text-foreground">
                    {parcel.parcelType} - {parcel.parcelSize}
                  </p>
                  <p className="text-xs text-muted-foreground">Weight: {parcel.weightKg ?? "-"} kg</p>
                  <p className="text-xs text-muted-foreground">Instructions: {parcel.instructions ?? "-"}</p>
                </div>
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Timeline</p>
                  <p className="text-xs text-muted-foreground">Booked: {formatDateTime(parcel.createdAt)}</p>
                  <p className="text-xs text-muted-foreground">Delivered: {formatDateTime(parcel.deliveredAt)}</p>
                  <p className="text-xs text-muted-foreground">Failed: {formatDateTime(parcel.failedAt)}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-white p-4 text-sm">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Agent</p>
                  <p className="font-semibold text-foreground">
                    {parcel.agentAssignment?.agent.name ?? "Not assigned"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {parcel.agentAssignment?.agent.email ?? "---"} - {parcel.agentAssignment?.agent.phone ?? "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">Assigned: {formatDateTime(parcel.agentAssignment?.assignedAt)}</p>
                </div>
                {parcel.qrCodeUrl ? (
                  <a href={parcel.qrCodeUrl} target="_blank" rel="noreferrer">
                    <Button variant="secondary" size="sm">
                      Open QR
                    </Button>
                  </a>
                ) : null}
                <Button variant="secondary" size="sm" onClick={refreshAgentLocation}>
                  Refresh agent location
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-[0.8fr,1.2fr]">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Route map</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[420px] w-full">
                  <ParcelTrackingMap
                    className="h-full w-full"
                    pickup={{ coords: pickupCoords, label: `Pickup: ${parcel.pickupAddress}` }}
                    delivery={{ coords: deliveryCoords, label: `Delivery: ${parcel.deliveryAddress}` }}
                    agent={{ coords: agentCoords, label: "Agent live location" }}
                    routePoints={routePoints}
                  />
                </div>
                <div className="space-y-1 px-6 py-4 text-sm text-muted-foreground">
                  <p>
                    Route points: <span className="font-semibold text-foreground">{validRouteTuples.length}</span>
                  </p>
                  <p>
                    Agent location:{" "}
                    {agentLocation ? `${agentLocation[0].toFixed(4)}, ${agentLocation[1].toFixed(4)}` : "Waiting for live update"}
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
