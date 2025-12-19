import { Eye, EyeOff, Loader2, MapPin, ShieldCheck, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import regisBg from "../assets/regis.png";
import { Button } from "../components/ui/button";
import { CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { MotionButton, MotionCard } from "../components/ui/motion";
import { Select } from "../components/ui/select";
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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

  const quickStats = [
    { label: "New workspaces", value: "42", meta: "today" },
    { label: "Agents invited", value: "188", meta: "this week" },
    { label: "Automation rules", value: "67", meta: "active" },
  ];

  const onboardingMoments = [
    { title: "Invite teammates", desc: "Share links that expire in 5 minutes." },
    { title: "Zone routing", desc: "Preset service areas and fallback carriers." },
    { title: "Data guard", desc: "SOC2-ready access logs for every login." },
  ];

  const badgeText = isOtpStep ? "Verify email" : "Create workspace";

  return (
    <div
      className="min-h-dvh bg-cover bg-center bg-no-repeat px-4 py-6 lg:py-10"
      style={{ backgroundImage: `linear-gradient(120deg, rgba(6,95,70,0.12), rgba(15,23,42,0.25)), url(${regisBg})` }}
    >
      <main className="mx-auto grid w-full max-w-6xl gap-6 lg:min-h-[80dvh] lg:grid-cols-[1.05fr,0.95fr]">
        <MotionCard className="flex flex-col gap-5 rounded-[32px] border-none bg-white/90 p-6 shadow-[0_40px_130px_-70px_rgba(15,23,42,0.75)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary shadow-inner ring-1 ring-[hsl(var(--border))]">
                <img src="/logo.svg" alt={brandName} className="h-6 w-6" />
              </div>
              <div className="leading-tight">
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Courier onboarding</p>
                <p className="text-lg font-semibold text-foreground">{brandName}</p>
              </div>
            </div>
            <span className="rounded-full border border-[hsl(var(--border))] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Guided setup
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground">Spin up your workspace</h1>
            <p className="text-sm text-muted-foreground">
              Register and go live with parcel booking, tracking, and agent assignments inside minutes.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {quickStats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-semibold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.meta}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[24px] border border-[hsl(var(--border))] bg-white px-4 py-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Why teams switch</p>
              <div className="mt-4 space-y-3">
                {highlights.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3 rounded-2xl p-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[24px] border border-[hsl(var(--border))] bg-gradient-to-br from-primary/10 via-emerald-50 to-white px-4 py-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Your first hour</p>
              <div className="mt-4 space-y-3">
                {onboardingMoments.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/60 bg-white/90 p-3">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MotionCard>

        <MotionCard className="flex flex-col rounded-[32px] border-none bg-white/95 p-6 shadow-[0_45px_130px_-90px_rgba(15,23,42,0.8)]">
          <CardHeader className="space-y-4 p-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {badgeText}
              </span>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" type="button">
                Support
              </Button>
            </div>
            <div>
              <CardTitle className="text-3xl font-semibold text-foreground">{isOtpStep ? "Verify your email" : "Create account"}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {isOtpStep ? "Enter the 6-digit OTP we sent to confirm your email address." : "Set up courier access for admins, agents, or customers."}
              </p>
            </div>
          </CardHeader>
          <CardContent className="mt-6 flex-1 p-0">
            {isOtpStep ? (
              <form onSubmit={onVerifyOtp} className="space-y-4">
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
                  OTP sent to <span className="font-semibold text-foreground">{pendingEmail}</span>.{" "}
                  {expiresLabel ? `Expires around ${expiresLabel}.` : "Expires in 5 minutes."}
                </div>
                <div className="space-y-1">
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
                  <MotionButton type="submit" className="flex-1 gap-2 rounded-2xl" disabled={otpState.isSubmitting}>
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
                    className="flex-1 rounded-2xl"
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
                <div className="space-y-1">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="John Doe" {...register("name", { required: true })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="name@email.com" {...register("email", { required: true })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={isPasswordVisible ? "text" : "password"}
                      placeholder="********"
                      className="pr-11"
                      {...register("password", { required: true, minLength: 6 })}
                    />
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition hover:text-foreground"
                      aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                    >
                      {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
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
                  <p className="text-xs text-muted-foreground">Pick how we tailor onboarding tips.</p>
                </div>
                <MotionButton type="submit" className="w-full gap-2 rounded-2xl" disabled={formState.isSubmitting}>
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
      </main>
    </div>
  );
}
