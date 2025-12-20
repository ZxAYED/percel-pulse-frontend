import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Pin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import { z } from "zod";
import { DateTimeField } from "../../components/form/DateTimeField";
import { TextField } from "../../components/form/TextField";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { MotionButton, MotionCard } from "../../components/ui/motion";
import { Select } from "../../components/ui/select";
import { PageTitle } from "../../components/ui/title";
import { runWithToast, toastError } from "../../lib/utils";
import { bookCustomerParcel } from "../../services/parcels";
import type { PaymentType } from "../../services/types";

const toNumberOrUndefined = (value: unknown) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const optionalTrimmedString = (): z.ZodType<string | undefined> =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().trim().min(1).optional()) as z.ZodType<
    string | undefined
  >;

const optionalUrl = (message = "Must be a valid URL"): z.ZodType<string | undefined> =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().url(message).optional()) as z.ZodType<
    string | undefined
  >;

const bookParcelSchema = z
  .object({
    pickupAddress: z.string().min(3, "Pickup address must be at least 3 characters"),
    deliveryAddress: z.string().min(3, "Delivery address must be at least 3 characters"),
    referenceCode: z.string().trim().min(1, "Reference code is required"),
    parcelType: z.string().trim().min(1, "Parcel type is required"),
    parcelSize: z.enum(["Small", "Medium", "Large"], { message: "Parcel size is required" }),
    weightKg: z.number().positive("Weight must be greater than 0"),
    instructions: z.string().trim().min(1, "Instructions are required").max(1000, "Instructions must be 1000 characters or less"),
    pickupLat: z.number().min(-90, "pickupLat must be between -90 and 90").max(90, "pickupLat must be between -90 and 90").optional(),
    pickupLng: z.number().min(-180, "pickupLng must be between -180 and 180").max(180, "pickupLng must be between -180 and 180").optional(),
    deliveryLat: z.number().min(-90, "deliveryLat must be between -90 and 90").max(90, "deliveryLat must be between -90 and 90").optional(),
    deliveryLng: z.number().min(-180, "deliveryLng must be between -180 and 180").max(180, "deliveryLng must be between -180 and 180").optional(),
    paymentType: z.enum(["COD", "PREPAID"]),
    codAmount: z.number().positive("COD amount must be greater than 0").optional(),
    expectedPickupAt: z.string().min(1, "Expected pickup time is required"),
    expectedDeliveryAt: z.string().min(1, "Expected delivery time is required"),
    proofOfPickupUrl: optionalUrl(),
    proofOfDeliveryUrl: optionalUrl(),
    qrCodeUrl: optionalUrl(),
    barcode: optionalTrimmedString(),
  })
  .refine((v) => v.paymentType !== "COD" || typeof v.codAmount === "number", { message: "codAmount required for COD", path: ["codAmount"] })
  .refine((v) => v.paymentType !== "PREPAID" || v.codAmount === undefined, { message: "codAmount must be omitted for PREPAID", path: ["codAmount"] })
  .refine((v) => (v.pickupLat == null && v.pickupLng == null) || (typeof v.pickupLat === "number" && typeof v.pickupLng === "number"), {
    message: "pickupLat and pickupLng must both be provided",
    path: ["pickupLat"],
  })
  .refine((v) => (v.deliveryLat == null && v.deliveryLng == null) || (typeof v.deliveryLat === "number" && typeof v.deliveryLng === "number"), {
    message: "deliveryLat and deliveryLng must both be provided",
    path: ["deliveryLat"],
  })
  .refine((v) => typeof v.pickupLat === "number" && typeof v.pickupLng === "number", { message: "Pickup location is required", path: ["pickupLat"] })
  .refine((v) => typeof v.deliveryLat === "number" && typeof v.deliveryLng === "number", { message: "Delivery location is required", path: ["deliveryLat"] });

type FormFields = z.input<typeof bookParcelSchema>;

const DEFAULT_DHAKA_BARIDHARA_DOHS_CENTER: [number, number] = [23.8103, 90.4125];

export default function CustomerBook() {
  const { register, handleSubmit, setValue, watch, formState, reset, control } = useForm<FormFields>({
    resolver: zodResolver(bookParcelSchema),
    defaultValues: {
      pickupAddress: "",
      deliveryAddress: "",
      referenceCode: "",
      parcelType: "",
      parcelSize: "Medium",
      weightKg: 1,
      instructions: "",
      pickupLat: undefined,
      pickupLng: undefined,
      deliveryLat: undefined,
      deliveryLng: undefined,
      paymentType: "COD",
      codAmount: undefined,
      expectedPickupAt: "",
      expectedDeliveryAt: "",
      qrCodeUrl: "",
      barcode: "",
    },
  });
  const [parcelSize, paymentType, pickupLat, pickupLng, deliveryLat, deliveryLng] = watch([
    "parcelSize",
    "paymentType",
    "pickupLat",
    "pickupLng",
    "deliveryLat",
    "deliveryLng",
  ]) as [
    FormFields["parcelSize"],
    PaymentType,
    FormFields["pickupLat"],
    FormFields["pickupLng"],
    FormFields["deliveryLat"],
    FormFields["deliveryLng"],
  ];
  const [activeField, setActiveField] = useState<"pickup" | "delivery">("pickup");
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_DHAKA_BARIDHARA_DOHS_CENTER);

  const pickupPos = useMemo(() => {
    if (typeof pickupLat === "number" && Number.isFinite(pickupLat) && typeof pickupLng === "number" && Number.isFinite(pickupLng)) {
      return [pickupLat, pickupLng] as [number, number];
    }
    return null;
  }, [pickupLat, pickupLng]);

  const deliveryPos = useMemo(() => {
    if (typeof deliveryLat === "number" && Number.isFinite(deliveryLat) && typeof deliveryLng === "number" && Number.isFinite(deliveryLng)) {
      return [deliveryLat, deliveryLng] as [number, number];
    }
    return null;
  }, [deliveryLat, deliveryLng]);

  const errorText = (message?: string) => (message ? <p className="text-xs text-rose-600">{message}</p> : null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setMapCenter(DEFAULT_DHAKA_BARIDHARA_DOHS_CENTER);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setMapCenter(coords);
      
        if (!pickupPos) {
          setValue("pickupLat", coords[0], { shouldValidate: true });
          setValue("pickupLng", coords[1], { shouldValidate: true });
        }
      },
      () => {
        setMapCenter(DEFAULT_DHAKA_BARIDHARA_DOHS_CENTER);
      
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [pickupPos, setValue]);

  function ClickToSet() {
    useMapEvents({
      click: (e) => {
        if (activeField === "pickup") {
          setValue("pickupLat", e.latlng.lat, { shouldValidate: true });
          setValue("pickupLng", e.latlng.lng, { shouldValidate: true });
        } else {
          setValue("deliveryLat", e.latlng.lat, { shouldValidate: true });
          setValue("deliveryLng", e.latlng.lng, { shouldValidate: true });
        }
      },
    });
    return null;
  }

  const onSubmit = handleSubmit(
    async (data) => {
      const parsed = bookParcelSchema.parse(data);
      const toIso = (value: string) => {
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? value : d.toISOString();
      };

      const payload = {
      pickupAddress: parsed.pickupAddress,
      deliveryAddress: parsed.deliveryAddress,
      referenceCode: parsed.referenceCode,
      parcelType: parsed.parcelType,
      parcelSize: parsed.parcelSize,
      weightKg: parsed.weightKg,
      instructions: parsed.instructions,
      pickupLat: parsed.pickupLat as number,
      pickupLng: parsed.pickupLng as number,
      deliveryLat: parsed.deliveryLat as number,
      deliveryLng: parsed.deliveryLng as number,
      paymentType: parsed.paymentType as PaymentType,
      codAmount: parsed.paymentType === "COD" ? (parsed.codAmount as number) : undefined,
      expectedPickupAt: toIso(parsed.expectedPickupAt),
      expectedDeliveryAt: toIso(parsed.expectedDeliveryAt),
      qrCodeUrl: parsed.qrCodeUrl ?? undefined,
      barcode: parsed.barcode ?? undefined,
      };

    const created = await runWithToast("Submitting booking...", () => bookCustomerParcel(payload), {
      success: (res) => `Booked. Tracking #${res.trackingNumber}`,
    });

    reset({
      pickupAddress: "",
      deliveryAddress: "",
      referenceCode: "",
      parcelType: "",
      parcelSize: "Medium",
      weightKg: 1,
      instructions: "",
      pickupLat: undefined,
      pickupLng: undefined,
      deliveryLat: undefined,
      deliveryLng: undefined,
      paymentType: "COD",
      codAmount: undefined,
      expectedPickupAt: "",
      expectedDeliveryAt: "",
      qrCodeUrl: "",
      barcode: "",
    });

    return created;
    },
    (errors) => {
      const hasMapError = Boolean(errors.pickupLat || errors.pickupLng || errors.deliveryLat || errors.deliveryLng);
      if (hasMapError) {
        toastError("Select pickup and delivery points on the map.");
        return;
      }
      toastError("Please fix the highlighted fields and try again.");
    }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle>Book a parcel pickup</PageTitle>
      </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <MotionCard className="relative ">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">Parcel details</CardTitle>
            <p className="text-sm text-muted-foreground">Pickup address, delivery address, parcel size, and payment preference.</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <TextField
                id="pickupAddress"
                label="Pickup address"
                placeholder="House 12, Dhanmondi"
                error={formState.errors.pickupAddress?.message}
                {...register("pickupAddress")}
              />
              <TextField
                id="deliveryAddress"
                label="Delivery address"
                placeholder="Road 18, Banani"
                error={formState.errors.deliveryAddress?.message}
                {...register("deliveryAddress")}
              />
              <TextField
                id="referenceCode"
                label="Reference code"
                placeholder="REF-2025-0001"
                error={formState.errors.referenceCode?.message}
                {...register("referenceCode")}
              />
              <TextField
                id="parcelType"
                label="Parcel type"
                placeholder="Documents"
                error={formState.errors.parcelType?.message}
                {...register("parcelType")}
              />
              <div className="space-y-2">
                <Label htmlFor="parcelSize">Parcel size</Label>
                <Select
                  value={parcelSize}
                  onChange={(val) => setValue("parcelSize", val as typeof parcelSize, { shouldValidate: true })}
                  options={[
                    { label: "Small (docs)", value: "Small" },
                    { label: "Medium (shoebox)", value: "Medium" },
                    { label: "Large (appliance)", value: "Large" },
                  ]}
                />
                {errorText(formState.errors.parcelSize?.message as string | undefined)}
              </div>
              <div className="space-y-2">
                <Label htmlFor="weightKg">Weight (kg)</Label>
                <Input
                  id="weightKg"
                  type="number"
                  inputMode="decimal"
                  placeholder="1.5"
                  {...register("weightKg", {
                    setValueAs: (v) => toNumberOrUndefined(v),
                  })}
                />
                {errorText(formState.errors.weightKg?.message)}
              </div>
              <TextField
                id="instructions"
                label="Instructions"
                placeholder="Leave at front desk. Handle with care."
                error={formState.errors.instructions?.message}
                {...register("instructions")}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <Controller
                  control={control}
                  name="expectedPickupAt"
                  render={({ field }) => (
                    <DateTimeField
                      id="expectedPickupAt"
                      label="Expected pickup"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={formState.errors.expectedPickupAt?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="expectedDeliveryAt"
                  render={({ field }) => (
                    <DateTimeField
                      id="expectedDeliveryAt"
                      label="Expected delivery"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={formState.errors.expectedDeliveryAt?.message}
                    />
                  )}
                />
              </div>
              <div className="grid gap-3 pb-10 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="paymentType">Payment</Label>
                  <Select
                    value={paymentType}
                    onChange={(val) => setValue("paymentType", val as PaymentType, { shouldValidate: true })}
                    options={[
                      { label: "Cash on delivery", value: "COD" },
                      { label: "Prepaid", value: "PREPAID" },
                    ]}
                  />
                </div>
                <TextField
                  id="barcode"
                  label="Barcode (optional)"
                  placeholder="CODE128-PP-000123456"
                  error={formState.errors.barcode?.message}
                  {...register("barcode")}
                />
              </div>
              <TextField
                id="qrCodeUrl"
                label="QR code URL (optional)"
                placeholder="https://example.com/qrcodes/parcel123.png"
                error={formState.errors.qrCodeUrl?.message}
                {...register("qrCodeUrl")}
              />
              {paymentType === "COD" && (
                <div className="space-y-2">
                  <Label htmlFor="codAmount">COD amount</Label>
                  <Input
                    id="codAmount"
                    type="number"
                    inputMode="decimal"
                    placeholder="500"
                    {...register("codAmount", {
                      setValueAs: (v) => toNumberOrUndefined(v),
                    })}
                  />
                  {errorText(formState.errors.codAmount?.message)}
                </div>
              )}
              <MotionButton type="submit" className="w-full gap-2" disabled={formState.isSubmitting}>
                Submit booking <ArrowRight size={16} />
              </MotionButton>
              {(formState.errors.pickupLat ||
                formState.errors.pickupLng ||
                formState.errors.deliveryLat ||
                formState.errors.deliveryLng) && <p className="text-xs text-rose-600">Select pickup and delivery points on the map.</p>}
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
                <Pin size={14} /> Set pickup on map{" "}
                {pickupPos ? `(${pickupPos[0].toFixed(4)}, ${pickupPos[1].toFixed(4)})` : ""}
              </button>
              <button
                type="button"
                onClick={() => setActiveField("delivery")}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 ${activeField === "delivery" ? "border-primary bg-primary/10 text-primary" : "border-[hsl(var(--border))] bg-secondary text-foreground"}`}
              >
                <Pin size={14} /> Set delivery on map{" "}
                {deliveryPos ? `(${deliveryPos[0].toFixed(4)}, ${deliveryPos[1].toFixed(4)})` : ""}
              </button>
            </div>
            <div className="h-[360px] overflow-hidden rounded-2xl border border-[hsl(var(--border))]">
              <MapContainer key={`${mapCenter[0]}-${mapCenter[1]}`} center={mapCenter} zoom={12} className="h-full w-full">
                <ClickToSet />
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {pickupPos && (
                  <Marker position={pickupPos}>
                    <Popup>Pickup location</Popup>
                  </Marker>
                )}
                {deliveryPos && (
                  <Marker position={deliveryPos}>
                    <Popup>Delivery location</Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: choose which address to set, then click on the map to capture latitude and longitude.
            </p>
            <input type="hidden" {...register("pickupLat")} />
            <input type="hidden" {...register("pickupLng")} />
            <input type="hidden" {...register("deliveryLat")} />
            <input type="hidden" {...register("deliveryLng")} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
