import { ArrowRight, MapPin, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import loginBg from "../assets/login.png";
import { CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { MotionButton, MotionCard } from "../components/ui/motion";
import { PageTitle } from "../components/ui/title";
import { useAuth } from "../hooks/useAuth";
import { brandName } from "../lib/brand";
import { Select } from "../components/ui/select";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch } = useForm<{ email: string; password: string; role: "admin" | "agent" | "customer" }>({
    defaultValues: { email: "", password: "", role: "customer" },
  });
  const role = watch("role");

  const onSubmit = handleSubmit(({ email, role }) => {
    const fakeToken = `${email}-token`;
    login({ token: fakeToken, user: { email, name: email.split("@")[0] || "User", role } });
    if (role === "admin") navigate("/admin");
    else if (role === "agent") navigate("/agent");
    else navigate("/customer");
  });

  const highlights = [
    { icon: MapPin, title: "Live tracking", desc: "Geolocation on every parcel with map overlays." },
    { icon: ShieldCheck, title: "Role-based control", desc: "Admin, agent, customer flows with RBAC." },
    { icon: TrendingUp, title: "Booking analytics", desc: "Daily bookings, failed deliveries, COD insights." },
  ];

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background/85 via-background/75 to-background/90" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_20%,rgba(129,140,248,0.18),transparent),radial-gradient(80%_80%_at_80%_0%,rgba(34,211,238,0.22),transparent)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 lg:flex-row lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_25px_90px_-50px_rgba(16,185,129,0.75)] backdrop-blur-2xl lg:w-1/2"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <Sparkles size={14} /> Modern glass UI
          </span>
          <PageTitle className="mt-4">{brandName}</PageTitle>
          <p className="mt-2 text-base text-muted-foreground">
            Courier and parcel management without a separate home page — this panel is your entry point to bookings, tracking, and agent coordination.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-muted-foreground">Uptime</p>
              <p className="text-xl font-semibold text-foreground">99.9%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-muted-foreground">Active agents</p>
              <p className="text-xl font-semibold text-foreground">24</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-muted-foreground">Routes today</p>
              <p className="text-xl font-semibold text-foreground">18</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {highlights.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-primary">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <MotionCard className="relative w-full max-w-xl lg:w-1/2">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-foreground">Sign in</CardTitle>
            <p className="text-sm text-muted-foreground">Login to manage and track parcels without losing context.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@email.com" {...register("email", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" {...register("password", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={role}
                  onChange={(val) => setValue("role", val as "admin" | "agent" | "customer")}
                  options={[
                    { label: "Customer", value: "customer" },
                    { label: "Delivery Agent", value: "agent" },
                    { label: "Admin", value: "admin" },
                  ]}
                />
              </div>
              <MotionButton type="submit" className="w-full gap-2">
                Login <ArrowRight size={16} />
              </MotionButton>
              <div className="text-center text-sm text-muted-foreground">
                <span>New here? </span>
                <button type="button" className="underline" onClick={() => navigate("/register")}>Create an account</button>
              </div>
            </form>
          </CardContent>
        </MotionCard>
      </div>
    </div>
  );
}
