import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SectionTitle } from "../../components/ui/title";
import { customerBookings, type Booking } from "../../data/customer";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

export default function CustomerHistory() {
  const [selected, setSelected] = useState<Booking>(customerBookings[0]);
  const bounds = useMemo(() => {
    if (!selected) return undefined;
    return [selected.pickupCoords, selected.deliveryCoords];
  }, [selected]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionTitle>Booking history & status</SectionTitle>
          <p className="text-sm text-muted-foreground">All parcels you booked with live statuses.</p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.1fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Parcels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customerBookings.map((item) => {
              const isActive = selected?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${isActive ? "border-primary bg-primary/5" : "border-[hsl(var(--border))] bg-white hover:border-primary/50"}`}
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.pickup} → {item.delivery} • {item.size} • {item.payment}
                    </p>
                    {item.description && <p className="text-xs text-muted-foreground">Note: {item.description}</p>}
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {item.status}
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="p-0">
          <CardHeader className="pb-2">
            <CardTitle className="px-6 text-lg font-semibold">Selected parcel map</CardTitle>
            <p className="px-6 text-xs text-muted-foreground">Shows pickup and delivery pins for the selected booking.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[380px] overflow-hidden rounded-b-[16px]">
              <MapContainer
                center={selected ? selected.pickupCoords : [23.81, 90.41]}
                bounds={bounds as any}
                zoom={12}
                className="h-full w-full"
              >
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {selected && (
                  <>
                    <Marker position={selected.pickupCoords}>
                      <Popup>Pickup: {selected.pickup}</Popup>
                    </Marker>
                    <Marker position={selected.deliveryCoords}>
                      <Popup>Delivery: {selected.delivery}</Popup>
                    </Marker>
                  </>
                )}
              </MapContainer>
            </div>
            {selected && (
              <div className="space-y-1 px-6 py-4 text-sm">
                <div className="font-semibold text-foreground">{selected.id}</div>
                <div className="text-muted-foreground">
                  {selected.pickup} ({selected.pickupCoords[0].toFixed(4)}, {selected.pickupCoords[1].toFixed(4)}) → {selected.delivery} ({selected.deliveryCoords[0].toFixed(4)}, {selected.deliveryCoords[1].toFixed(4)})
                </div>
                {selected.description && <div className="text-muted-foreground">Note: {selected.description}</div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
