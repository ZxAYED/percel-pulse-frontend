import { ArrowRight, MapPin, Package, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { MotionButton, MotionCard } from "../../components/ui/motion";
import { PageTitle } from "../../components/ui/title";
import { Select } from "../../components/ui/select";

export default function CustomerBook() {
  const { register, handleSubmit, setValue, watch } = useForm<{ pickup: string; delivery: string; size: "Small" | "Medium" | "Large"; payment: "COD" | "Prepaid" }>({
    defaultValues: { pickup: "", delivery: "", size: "Medium", payment: "COD" },
  });
  const size = watch("size");
  const payment = watch("payment");

  const onSubmit = handleSubmit(({ pickup, delivery, size, payment }) => {
    console.log("Booking payload", { pickup, delivery, size, payment });
    alert("Booking submitted (check console)");
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
              <div className="grid gap-3 md:grid-cols-2">
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
            <CardTitle>What happens next</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: MapPin, title: "Route assigned", desc: "A rider will pick from your pickup address." },
              { icon: Package, title: "Parcel scanned", desc: "Label and QR ready for doorstep confirmation." },
              { icon: Wallet, title: "Payment ready", desc: "COD or prepaid noted in the rider app." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3">
                <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Icon size={16} className="text-primary" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
