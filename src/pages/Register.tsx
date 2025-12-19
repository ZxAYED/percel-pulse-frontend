import { motion } from "framer-motion";
import { Loader2, MapPin, ShieldCheck, TrendingUp, Truck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import regisBg from "../assets/regis.png";
import { CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { MotionButton, MotionCard } from "../components/ui/motion";
import { Select } from "../components/ui/select";
import { PageTitle } from "../components/ui/title";
import { brandName } from "../lib/brand";
import { runWithToast } from "../lib/utils";
import { registerUser, resendOtp, verifyOtp } from "../services/auth";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  role: "CUSTOMER" | "AGENT" | "ADMIN";
};

export default function Register() {
  const navigate = useNavigate();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const { register, handleSubmit, setValue, watch, formState } = useForm<RegisterForm>({
    defaultValues: { name: "", email: "", password: "", role: "CUSTOMER" },
  });
  const role = watch("role");

  const {
    register: registerOtpField,
    handleSubmit: handleOtpSubmit,
    formState: otpState,
    reset: resetOtpForm,
  } = useForm<{ otp: string }>({ defaultValues: { otp: "" } });

  const isOtpStep = Boolean(pendingEmail);

  const onSubmit = handleSubmit(async (values) => {
    const data = await runWithToast("Creating your workspace...", () => registerUser(values), {
      success: () => "OTP sent to your email",
    });
    if (!data) return;
    setPendingEmail(data.user.email);
    setOtpExpiresAt(data.otpExpiresAt);
    resetOtpForm();
  });

  const onVerifyOtp = handleOtpSubmit(async ({ otp }) => {
    if (!pendingEmail) return;
    await runWithToast("Verifying OTP...", () => verifyOtp({ email: pendingEmail, otp }), {
      success: () => "Email verified. Please sign in.",
    });
    navigate("/login", { replace: true });
  });

  const handleResend = async () => {
    if (!pendingEmail) return;
    setIsResending(true);
    try {
      const data = await runWithToast("Sending OTP again...", () => resendOtp(pendingEmail), {
        success: () => "OTP resent",
      });
      setOtpExpiresAt(data.expiresAt);
    } finally {
      setIsResending(false);
    }
  };

  const expiresLabel = otpExpiresAt ? new Date(otpExpiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;

  const highlights = [
    { icon: MapPin, title: "Live map view", desc: "Track parcels and optimized routes in real time." },
    { icon: ShieldCheck, title: "RBAC ready", desc: "Admin, agent, and customer roles out of the box." },
    { icon: TrendingUp, title: "Ops analytics", desc: "Bookings, COD, and failed deliveries surfaced instantly." },
  ];

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: `url(${regisBg})` }}
    >
    
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 lg:flex-row lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden w-full rounded-3xl border border-[hsl(var(--border))] bg-white p-8 shadow-xl lg:block lg:w-1/2"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <Truck size={14} /> Start faster
          </div>
          <PageTitle className="mt-4">{brandName}</PageTitle>
          <p className="mt-2 text-base text-muted-foreground">
            Create your account and jump straight into parcel booking, tracking, and agent assignments.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "New today", value: "42 bookings" },
              { label: "Agents online", value: "24" },
              { label: "Support", value: "Live chat" },
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
            <CardTitle className="text-2xl font-semibold text-foreground">
              {isOtpStep ? "Verify your email" : "Create account"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isOtpStep
                ? "Enter the 6-digit OTP we sent to confirm your email address."
                : "Register to book pickups, track parcels, and manage assignments."}
            </p>
          </CardHeader>
          <CardContent>
            {isOtpStep ? (
              <form onSubmit={onVerifyOtp} className="space-y-5">
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary/60 p-4 text-sm text-muted-foreground">
                  We sent an OTP to <span className="font-semibold text-foreground">{pendingEmail}</span>.{" "}
                  {expiresLabel ? `Expires around ${expiresLabel}.` : "Expires in 5 minutes."}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otp">One-time password</Label>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    {...registerOtpField("otp", { required: true, minLength: 6 })}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <MotionButton type="submit" className="flex-1 gap-2" disabled={otpState.isSubmitting}>
                    {otpState.isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Verifying
                      </>
                    ) : (
                      "Verify & continue"
                    )}
                  </MotionButton>
                  <MotionButton
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={handleResend}
                    disabled={otpState.isSubmitting || isResending}
                  >
                    {isResending ? <Loader2 size={16} className="animate-spin" /> : "Resend OTP"}
                  </MotionButton>
                </div>
                <div className="flex flex-wrap justify-between gap-3 text-sm text-muted-foreground">
                  <button
                    type="button"
                    className="text-primary underline-offset-2 hover:underline"
                    onClick={() => {
                      setPendingEmail(null);
                      setOtpExpiresAt(null);
                      setIsResending(false);
                    }}
                  >
                    Edit account details
                  </button>
                  <button type="button" className="underline" onClick={() => navigate("/login")}>
                    Back to sign in
                  </button>
                </div>
              </form>
            ) : (
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
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password", { required: true, minLength: 6 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={role}
                    onChange={(val) => setValue("role", val as RegisterForm["role"])}
                    options={[
                      { label: "Customer", value: "CUSTOMER" },
                      { label: "Delivery Agent", value: "AGENT" },
                      { label: "Admin", value: "ADMIN" },
                    ]}
                  />
                </div>
                <MotionButton type="submit" className="w-full gap-2" disabled={formState.isSubmitting}>
                  {formState.isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Register"}
                </MotionButton>
                <div className="text-center text-sm text-muted-foreground">
                  <span>Already have an account? </span>
                  <button type="button" className="underline" onClick={() => navigate("/login")}>
                    Sign in
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </MotionCard>
      </div>
    </div>
  );
}
