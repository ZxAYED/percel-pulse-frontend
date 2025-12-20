import { Navigation, Radio, Square } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ParcelTrackingMap } from "../../components/maps/ParcelTrackingMap";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { MotionCard } from "../../components/ui/motion";
import { Select } from "../../components/ui/select";
import { PageTitle } from "../../components/ui/title";
import { useAuth } from "../../hooks/useAuth";
import { toastError, toastSuccess } from "../../lib/utils";
import { listAgentParcels, postAgentLocation, updateAgentParcelStatus } from "../../services/parcels";
import type { AgentParcel } from "../../services/types";
import { createWsClient } from "../../services/ws";

export default function AgentTasks() {
  const { token } = useAuth();
  const [parcels, setParcels] = useState<AgentParcel[]>([]);
  const [meta, setMeta] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [locatingId, setLocatingId] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<Record<string, "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "FAILED">>({});
  const [remarksDraft, setRemarksDraft] = useState<Record<string, string>>({});
  const [liveMapId, setLiveMapId] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<Record<string, boolean>>({});
  const [agentPositions, setAgentPositions] = useState<Record<string, { lat: number; lng: number; recordedAt?: string }>>({});

  const liveRef = useRef(new Map<string, { watchId: number; lastRest: number; lastWs: number }>());

  const wsClient = useMemo(() => {
    if (!token) return null;
    const client = createWsClient({ token });
    return client;
  }, [token]);

  useEffect(() => {
    if (!wsClient) return;
    wsClient.connect();
    return () => wsClient.close();
  }, [wsClient]);

  useEffect(() => {
    return () => {
      for (const entry of liveRef.current.values()) navigator.geolocation.clearWatch(entry.watchId);
      liveRef.current.clear();
    };
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return listAgentParcels({ page, limit, searchTerm: searchTerm || undefined })
      .then((res) => {
        setParcels(res.data ?? []);
        setMeta(res.meta ?? null);
        if (wsClient) {
          for (const p of res.data ?? []) wsClient.joinParcel(p.id);
        }
      })
      .catch((err) => {
        setParcels([]);
        setMeta(null);
        setError("Failed to load assigned parcels");
        toastError(err, "Failed to load assigned parcels");
      })
      .finally(() => setLoading(false));
  }, [limit, page, searchTerm, wsClient]);

  useEffect(() => {
    let mounted = true;
    const debounce = window.setTimeout(() => {
      if (!mounted) return;
      void load();
    }, 500);
    return () => {
      mounted = false;
      window.clearTimeout(debounce);
    };
  }, [load]);

  const totalPages = meta?.totalPages ?? 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const statusOptions = useMemo(
    () => [
      { label: "Picked up", value: "PICKED_UP" },
      { label: "In transit", value: "IN_TRANSIT" },
      { label: "Delivered", value: "DELIVERED" },
      { label: "Failed", value: "FAILED" },
    ] as const,
    []
  );

  const toneByStatus: Record<string, string> = {
    BOOKED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    PICKED_UP: "bg-cyan-100 text-cyan-700 border-cyan-200",
    IN_TRANSIT: "bg-blue-100 text-blue-700 border-blue-200",
    DELIVERED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    FAILED: "bg-rose-100 text-rose-700 border-rose-200",
  };

  const activeParcels = useMemo(
    () => parcels.filter((p) => p.status === "BOOKED" || p.status === "PICKED_UP" || p.status === "IN_TRANSIT"),
    [parcels]
  );
  const completedParcels = useMemo(
    () => parcels.filter((p) => p.status === "DELIVERED" || p.status === "FAILED"),
    [parcels]
  );

  const sendLocation = useCallback(
    async (payload: { parcelId: string; latitude: number; longitude: number; speedKph?: number; heading?: number }, mode: "manual" | "live") => {
      if (!payload.parcelId) return;
      wsClient?.joinParcel(payload.parcelId);

      const now = Date.now();
      const liveEntry = liveRef.current.get(payload.parcelId);
      const shouldSendWs = mode === "manual" || !liveEntry || now - liveEntry.lastWs >= 1500;
      const shouldSendRest = mode === "manual" || !liveEntry || now - liveEntry.lastRest >= 10_000;

      if (shouldSendWs) {
        wsClient?.sendAgentLocationUpdate(payload);
        if (liveEntry) liveEntry.lastWs = now;
      }

      if (shouldSendRest) {
        try {
          const res = await postAgentLocation(payload);
          if (mode === "manual") toastSuccess(res, "Location sent");
          if (liveEntry) liveEntry.lastRest = now;
        } catch (err) {
          if (mode === "manual") toastError(err, "Failed to send location");
        }
      }
    },
    [wsClient]
  );

  const startLive = (parcelId: string) => {
    if (!navigator.geolocation?.watchPosition) {
      toastError(null, "Geolocation is not supported");
      return;
    }
    if (liveRef.current.has(parcelId)) return;

    setLiveStatus((prev) => ({ ...prev, [parcelId]: true }));
    wsClient?.joinParcel(parcelId);

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const payload = {
          parcelId,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          speedKph: typeof pos.coords.speed === "number" ? pos.coords.speed * 3.6 : undefined,
          heading: typeof pos.coords.heading === "number" ? pos.coords.heading : undefined,
        };
        setAgentPositions((prev) => ({ ...prev, [parcelId]: { lat: payload.latitude, lng: payload.longitude, recordedAt: new Date().toISOString() } }));
        void sendLocation(payload, "live");
      },
      (err) => {
        toastError(err, "Unable to watch device location");
        stopLive(parcelId);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10_000 }
    );

    liveRef.current.set(parcelId, { watchId, lastRest: 0, lastWs: 0 });
  };

  const stopLive = (parcelId: string) => {
    const entry = liveRef.current.get(parcelId);
    if (entry) {
      navigator.geolocation.clearWatch(entry.watchId);
      liveRef.current.delete(parcelId);
    }
    setLiveStatus((prev) => ({ ...prev, [parcelId]: false }));
  };

  useEffect(() => {
    const activeIds = new Set(activeParcels.map((p) => p.id));
    for (const [parcelId, entry] of Array.from(liveRef.current.entries())) {
      if (activeIds.has(parcelId)) continue;
      navigator.geolocation.clearWatch(entry.watchId);
      liveRef.current.delete(parcelId);
      setLiveStatus((prev) => ({ ...prev, [parcelId]: false }));
    }
  }, [activeParcels]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageTitle>Tasks & COD</PageTitle>
          <p className="text-sm text-muted-foreground">View assigned parcels, update statuses, and publish live location.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr,160px]">
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search assigned parcels..." />
          <Select
            value={String(limit)}
            onChange={(v) => setLimit(Number(v))}
            options={[
              { label: "10 / page", value: "10" },
              { label: "20 / page", value: "20" },
              { label: "50 / page", value: "50" },
            ]}
          />
        </CardContent>
      </Card>

      <MotionCard>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground">Active assignments</CardTitle>
          <p className="text-sm text-muted-foreground">Update status and push location for booked, picked up, or in-transit parcels.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3 text-sm text-muted-foreground">
              Loading assigned parcels...
            </div>
          )}
          {error && !loading && (
            <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          )}
          {!loading && !error && activeParcels.length === 0 && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3 text-sm text-muted-foreground">
              No active assignments found.
            </div>
          )}

          {!loading &&
            !error &&
            activeParcels.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-3 rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{p.trackingNumber}</span>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${toneByStatus[p.status] ?? "bg-secondary text-muted-foreground border-transparent"}`}>
                      {p.status}
                    </span>
                    {liveStatus[p.id] && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Live</span>}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {p.pickupAddress} - {p.deliveryAddress}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.paymentType}
                    {p.paymentType === "COD" && p.codAmount ? ` BDT ${p.codAmount}` : ""}
                  </p>
                </div>

                <div className="flex flex-col gap-2 md:w-[360px]">
                  <Select
                    value={statusDraft[p.id] ?? (p.status === "BOOKED" ? "" : (p.status as any))}
                    onChange={(v) => setStatusDraft((prev) => ({ ...prev, [p.id]: v as any }))}
                    options={[
                      { label: "Select status", value: "" },
                      ...statusOptions.map((s) => ({ label: s.label, value: s.value })),
                    ]}
                  />
                  <Input
                    value={remarksDraft[p.id] ?? ""}
                    onChange={(e) => setRemarksDraft((prev) => ({ ...prev, [p.id]: e.target.value }))}
                    placeholder="Remarks (optional)"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={updatingId === p.id || !(statusDraft[p.id] ?? "").trim()}
                      onClick={() => {
                        const nextStatus = (statusDraft[p.id] ?? "").trim() as any;
                        const remarks = (remarksDraft[p.id] ?? "").trim();
                        setUpdatingId(p.id);
                        updateAgentParcelStatus({ parcelId: p.id, status: nextStatus, remarks: remarks || undefined })
                          .then((res) => {
                            toastSuccess(res, "Status updated");
                            void load();
                          })
                          .catch((err) => {
                            toastError(err, "Failed to update status");
                          })
                          .finally(() => setUpdatingId((curr) => (curr === p.id ? null : curr)));
                      }}
                      className="flex-1"
                    >
                      Update
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={locatingId === p.id}
                      onClick={() => {
                        setLocatingId(p.id);
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            const speedKph = typeof pos.coords.speed === "number" ? pos.coords.speed * 3.6 : undefined;
                            const heading = typeof pos.coords.heading === "number" ? pos.coords.heading : undefined;
                            const payload = {
                              parcelId: p.id,
                              latitude: pos.coords.latitude,
                              longitude: pos.coords.longitude,
                              speedKph,
                              heading,
                            };
                            setAgentPositions((prev) => ({ ...prev, [p.id]: { lat: payload.latitude, lng: payload.longitude, recordedAt: new Date().toISOString() } }));
                            sendLocation(payload, "manual").finally(() => setLocatingId((curr) => (curr === p.id ? null : curr)));
                          },
                          (err) => {
                            toastError(err, "Unable to fetch device location");
                            setLocatingId((curr) => (curr === p.id ? null : curr));
                          }
                        );
                      }}
                      className="gap-2"
                    >
                      <Navigation size={16} /> Location
                    </Button>
                    <Button
                      size="sm"
                      variant={liveStatus[p.id] ? "destructive" : "secondary"}
                      onClick={() => (liveStatus[p.id] ? stopLive(p.id) : startLive(p.id))}
                      className="gap-2"
                    >
                      {liveStatus[p.id] ? <Square size={14} /> : <Radio size={14} />}
                      {liveStatus[p.id] ? "Stop live" : "Go live"}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setLiveMapId((curr) => (curr === p.id ? null : p.id))}>
                      {liveMapId === p.id ? "Hide map" : "Map"}
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground md:w-[220px] md:text-right">
                  {agentPositions[p.id]
                    ? `Last ping: ${agentPositions[p.id].lat.toFixed(5)}, ${agentPositions[p.id].lng.toFixed(5)}`
                    : "No location sent yet"}
                </div>
              </div>
            ))}

          {liveMapId && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-white shadow-sm">
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Live route map</p>
                  <p className="text-xs text-muted-foreground">Pickup, drop, and your latest location update in real time.</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setLiveMapId(null)}>
                  Close
                </Button>
              </div>
              {(() => {
                const mapParcel = activeParcels.find((ap) => ap.id === liveMapId);
                const pickup =
                  mapParcel && typeof mapParcel.pickupLat === "number" && typeof mapParcel.pickupLng === "number"
                    ? { lat: mapParcel.pickupLat, lng: mapParcel.pickupLng }
                    : null;
                const delivery =
                  mapParcel && typeof mapParcel.deliveryLat === "number" && typeof mapParcel.deliveryLng === "number"
                    ? { lat: mapParcel.deliveryLat, lng: mapParcel.deliveryLng }
                    : null;
                const agent = agentPositions[liveMapId] ?? null;
                if (!mapParcel) {
                  return <div className="px-4 py-3 text-sm text-muted-foreground">Selected parcel is no longer active.</div>;
                }
                return (
              <div className="h-[320px] w-full overflow-hidden rounded-b-2xl border-t border-[hsl(var(--border))]">
                <ParcelTrackingMap
                  className="h-full w-full"
                  pickup={{ coords: pickup, label: "Pickup" }}
                  delivery={{ coords: delivery, label: "Delivery" }}
                  agent={{ coords: agent, label: liveStatus[liveMapId] ? "You (live)" : "Last ping" }}
                  routePoints={[]}
                />
              </div>
                );
              })()}
            </div>
          )}

          {!loading && !error && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-sm">
              <div className="text-muted-foreground">
                Page <span className="font-semibold text-foreground">{page}</span> of{" "}
                <span className="font-semibold text-foreground">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" disabled={!canPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Prev
                </Button>
                <Button variant="secondary" size="sm" disabled={!canNext} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </MotionCard>

      <MotionCard>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground">Completed assignments</CardTitle>
          <p className="text-sm text-muted-foreground">Delivered or failed parcels are listed here for reference.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {!loading && !error && completedParcels.length === 0 && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3 text-sm text-muted-foreground">
              No completed assignments found.
            </div>
          )}

          {!loading &&
            !error &&
            completedParcels.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-3 rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{p.trackingNumber}</span>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${toneByStatus[p.status] ?? "bg-secondary text-muted-foreground border-transparent"}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {p.pickupAddress} -{p.deliveryAddress}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.paymentType}
                    {p.paymentType === "COD" && p.codAmount ? ` BDT ${p.codAmount}` : ""}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Updated: {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-"}
                </div>
              </div>
            ))}
        </CardContent>
      </MotionCard>
    </div>
  );
}
