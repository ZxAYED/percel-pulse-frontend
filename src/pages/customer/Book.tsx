import { ArrowRight, MapPin, Package, Pin, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { MapContainer, Marker, TileLayer, Popup, useMapEvents } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { MotionButton, MotionCard } from "../../components/ui/motion";
import { Select } from "../../components/ui/select";
import { PageTitle } from "../../components/ui/title";
import type { Booking } from "../../data/customer";
import { toast } from "sonner";

type FormFields = Pick<Booking, "pickup" | "delivery" | "size" | "payment" | "description"> & {
  pickupCoords?: [number, number];
  deliveryCoords?: [number, number];
};

export default function CustomerBook() {
  const { register, handleSubmit, setValue, watch } = useForm<FormFields>({
    defaultValues: { pickup: "", delivery: "", size: "Medium", payment: "COD", description: "" },
  });
  const size = watch("size");
  const payment = watch("payment");
  const pickupCoords = watch("pickupCoords");
  const deliveryCoords = watch("deliveryCoords");
  const [activeField, setActiveField] = useState<"pickup" | "delivery">("pickup");
  const defaultCenter: [number, number] = [23.8103, 90.4125];

  function ClickToSet() {
    useMapEvents({
      click: (e) => {
        const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
        if (activeField === "pickup") setValue("pickupCoords", coords);
        else setValue("deliveryCoords", coords);
      },
    });
    return null;
  }

  const onSubmit = handleSubmit((data) => {
    console.log("Booking payload", data);
    toast.success("Booking submitted", { description: "We captured your addresses and coordinates." });
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle>Book a parcel pickup</PageTitle>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <MotionCard className="relative">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">Parcel details</CardTitle>
            <p className="text-sm text-muted-foreground">Pickup address, delivery address, parcel size, and payment preference.</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="pickup">Pickup address</Label>
                <Input id="pickup" placeholder="House 12, Dhanmondi" {...register("pickup", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery">Delivery address</Label>
                <Input id="delivery" placeholder="Road 18, Banani" {...register("delivery", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input id="description" placeholder="Notes for rider (optional)" {...register("description")} />
              </div>
              <div className="grid gap-3 pb-10 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="size">Parcel size/type</Label>
                  <Select
                    value={size}
                    onChange={(val) => setValue("size", val as typeof size)}
                    options={[
                      { label: "Small (docs)", value: "Small" },
                      { label: "Medium (shoebox)", value: "Medium" },
                      { label: "Large (appliance)", value: "Large" },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment">Payment</Label>
                  <Select
                    value={payment}
                    onChange={(val) => setValue("payment", val as typeof payment)}
                    options={[
                      { label: "Cash on delivery", value: "COD" },
                      { label: "Prepaid", value: "Prepaid" },
                    ]}
                  />
                </div>
              </div>
              <MotionButton type="submit" className="w-full gap-2">
                Submit booking <ArrowRight size={16} />
              </MotionButton>
            </form>
          </CardContent>
        </MotionCard>

        <Card>
          <CardHeader>
            <CardTitle>Set locations on map</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                onClick={() => setActiveField("pickup")}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 ${activeField === "pickup" ? "border-primary bg-primary/10 text-primary" : "border-[hsl(var(--border))] bg-secondary text-foreground"}`}
              >
                <Pin size={14} /> Set pickup on map {pickupCoords ? `(${pickupCoords[0].toFixed(4)}, ${pickupCoords[1].toFixed(4)})` : ""}
              </button>
              <button
                type="button"
                onClick={() => setActiveField("delivery")}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 ${activeField === "delivery" ? "border-primary bg-primary/10 text-primary" : "border-[hsl(var(--border))] bg-secondary text-foreground"}`}
              >
                <Pin size={14} /> Set delivery on map {deliveryCoords ? `(${deliveryCoords[0].toFixed(4)}, ${deliveryCoords[1].toFixed(4)})` : ""}
              </button>
            </div>
            <div className="h-[360px] overflow-hidden rounded-2xl border border-[hsl(var(--border))]">
              <MapContainer center={defaultCenter} zoom={12} className="h-full w-full">
                <ClickToSet />
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {pickupCoords && (
                  <Marker position={pickupCoords}>
                    <Popup>Pickup location</Popup>
                  </Marker>
                )}
                {deliveryCoords && (
                  <Marker position={deliveryCoords}>
                    <Popup>Delivery location</Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: choose which address to set, then click on the map to capture latitude and longitude.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
