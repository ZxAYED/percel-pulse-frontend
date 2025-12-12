import { MapPin, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import regisBg from "../assets/regis.png";
import { CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { MotionButton, MotionCard } from "../components/ui/motion";
import { PageTitle } from "../components/ui/title";
import { brandName } from "../lib/brand";
import { useAuth } from "../hooks/useAuth";
import { Select } from "../components/ui/select";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, setValue, watch } = useForm<{ name: string; email: string; password: string; role: "admin" | "agent" | "customer" }>({
    defaultValues: { name: "", email: "", password: "", role: "customer" },
  });
  const role = watch("role");

  const onSubmit = handleSubmit(({ name, email, role }) => {
    const fakeToken = `${email}-token`;
    login({ token: fakeToken, user: { name, email, role } });
    if (role === "admin") navigate("/admin");
    else if (role === "agent") navigate("/agent");
    else navigate("/customer");
  });

  const highlights = [
    { icon: MapPin, title: "Live map view", desc: "Track parcels and optimized routes in real-time." },
    { icon: ShieldCheck, title: "RBAC ready", desc: "Admin, Agent, Customer roles separated out of the box." },
    { icon: TrendingUp, title: "Ops analytics", desc: "Bookings, COD, failed deliveries surfaced instantly." },
  ];

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${regisBg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background/85 via-background/75 to-background/90" />
      <div className="absolute inset-0 bg-[radial-gradient(110%_70%_at_20%_20%,rgba(129,140,248,0.18),transparent),radial-gradient(90%_90%_at_80%_10%,rgba(34,211,238,0.22),transparent)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 lg:flex-row lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_25px_90px_-50px_rgba(16,185,129,0.75)] backdrop-blur-2xl lg:w-1/2"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <Sparkles size={14} /> Start faster
          </span>
          <PageTitle className="mt-4">{brandName}</PageTitle>
          <p className="mt-2 text-base text-muted-foreground">
            Create your account and jump straight into parcel booking, tracking, and agent assignments — no home page detour needed.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-muted-foreground">New today</p>
              <p className="text-xl font-semibold text-foreground">42 bookings</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-muted-foreground">Agents online</p>
              <p className="text-xl font-semibold text-foreground">24</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-muted-foreground">Support</p>
              <p className="text-xl font-semibold text-foreground">Live chat</p>
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
            <CardTitle className="text-2xl font-semibold text-foreground">Create account</CardTitle>
            <p className="text-sm text-muted-foreground">Register to book and track parcels with a sleek glass UI.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="John Doe" {...register("name", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@email.com" {...register("email", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" {...register("password", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
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
              <MotionButton type="submit" className="w-full">Register</MotionButton>
              <div className="text-center text-sm text-muted-foreground">
                <span>Already have an account? </span>
                <button type="button" className="underline" onClick={() => navigate("/login")}>Sign in</button>
              </div>
            </form>
          </CardContent>
        </MotionCard>
      </div>
    </div>
  );
}
