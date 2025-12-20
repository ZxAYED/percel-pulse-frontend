import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import type { TrackingPoint } from "../../services/types";
import { agentPinIcon, deliveryPinIcon, pickupPinIcon } from "../../lib/leafletIcons";

const DEFAULT_CENTER: LatLngTuple = [23.8103, 90.4125];

type Coords = { lat: number; lng: number };

function toTuple(coords?: Coords | null): LatLngTuple | null {
  if (!coords) return null;
  const lat = Number(coords.lat);
  const lng = Number(coords.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

function toTupleFromPoint(pt?: TrackingPoint | null): LatLngTuple | null {
  if (!pt) return null;
  const lat = Number(pt.latitude);
  const lng = Number(pt.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

export type ParcelTrackingMapProps = {
  pickup?: { coords?: Coords | null; label?: string };
  delivery?: { coords?: Coords | null; label?: string };
  agent?: { coords?: Coords | null; label?: string };
  routePoints?: TrackingPoint[];
  className?: string;
  zoom?: number;
};

export function ParcelTrackingMap({
  pickup,
  delivery,
  agent,
  routePoints,
  className,
  zoom = 12,
}: ParcelTrackingMapProps) {
  const pickupPos = useMemo(() => toTuple(pickup?.coords), [pickup?.coords]);
  const deliveryPos = useMemo(() => toTuple(delivery?.coords), [delivery?.coords]);
  const agentPos = useMemo(() => toTuple(agent?.coords), [agent?.coords]);

  const route = useMemo<LatLngTuple[]>(() => {
    const pts: LatLngTuple[] = [];
    for (const pt of routePoints ?? []) {
      const tuple = toTupleFromPoint(pt);
      if (tuple) pts.push(tuple);
    }
    return pts;
  }, [routePoints]);

  const bounds = useMemo<LatLngBoundsExpression | undefined>(() => {
    const pts: LatLngTuple[] = [];
    if (pickupPos) pts.push(pickupPos);
    if (deliveryPos) pts.push(deliveryPos);
    if (agentPos) pts.push(agentPos);
    for (const p of route) pts.push(p);
    if (pts.length < 2) return undefined;
    return pts as LatLngBoundsExpression;
  }, [agentPos, deliveryPos, pickupPos, route]);

  const center = agentPos ?? pickupPos ?? deliveryPos ?? DEFAULT_CENTER;

  return (
    <MapContainer center={center} bounds={bounds} zoom={zoom} className={className ?? "h-full w-full"}>
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {route.length >= 2 && <Polyline positions={route} pathOptions={{ color: "#10b981", weight: 5 }} />}
      {pickupPos && (
        <Marker position={pickupPos} icon={pickupPinIcon}>
          <Popup>{pickup?.label ?? "Pickup location"}</Popup>
        </Marker>
      )}
      {deliveryPos && (
        <Marker position={deliveryPos} icon={deliveryPinIcon}>
          <Popup>{delivery?.label ?? "Delivery location"}</Popup>
        </Marker>
      )}
      {agentPos && (
        <Marker position={agentPos} icon={agentPinIcon}>
          <Popup>{agent?.label ?? "Agent location"}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
