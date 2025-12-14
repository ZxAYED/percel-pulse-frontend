import { motion } from "framer-motion";
import { ArrowRight, MapPin, ShieldCheck, TrendingUp, Truck } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import loginBg from "../assets/login.png";
import { CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { MotionButton, MotionCard } from "../components/ui/motion";
import { Select } from "../components/ui/select";
import { PageTitle } from "../components/ui/title";
import { useAuth } from "../hooks/useAuth";
import { brandName } from "../lib/brand";

type LoginForm = { email: string; password: string; role: "admin" | "agent" | "customer" };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch } = useForm<LoginForm>({
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
    { icon: MapPin, title: "Live tracking", desc: "Follow every pickup and drop in real time." },
    { icon: ShieldCheck, title: "Role control", desc: "Admin, agent, and customer workflows kept separate." },
    { icon: TrendingUp, title: "Ops analytics", desc: "Bookings, COD, failed deliveries, and SLA health together." },
  ];

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
    
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 lg:flex-row lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden w-full rounded-3xl border border-[hsl(var(--border))] bg-white p-8 shadow-xl lg:block lg:w-1/2"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <Truck size={14} /> Courier control center
          </div>
          <PageTitle className="mt-4">{brandName}</PageTitle>
          <p className="mt-2 text-base text-muted-foreground">
            Book pickups, dispatch agents, and let customers track parcels in one workspace.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "On-road parcels", value: "86" },
              { label: "Agents online", value: "24" },
              { label: "Today’s bookings", value: "1,240" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[hsl(var(--border))] bg-secondary p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-xl font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            {highlights.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 rounded-2xl border border-[hsl(var(--border))] bg-white p-3 shadow-sm">
                <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
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

        <MotionCard className="relative w-full max-w-xl border border-[hsl(var(--border))] bg-white shadow-xl lg:w-1/2">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-foreground">Sign in</CardTitle>
            <p className="text-sm text-muted-foreground">Manage bookings, tracking, and agent coordination from one login.</p>
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
