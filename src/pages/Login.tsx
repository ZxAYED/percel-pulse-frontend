import { ArrowRight, Eye, EyeOff, Loader2, MapPin, ShieldCheck, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import loginBg from "../assets/login.png";
import { CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { MotionButton, MotionCard } from "../components/ui/motion";
import { Select } from "../components/ui/select";
import type { Role } from "../context/AuthContextBase";
import { useAuth } from "../hooks/useAuth";
import { brandName } from "../lib/brand";
import { runWithToast } from "../lib/utils";
import { loginUser, requestPasswordReset, resendOtp, resetPassword, verifyOtp } from "../services/auth";

type LoginForm = { email: string; password: string };
type ActiveView = "login" | "verify" | "reset" | "send-otp";
type ResetStep = "request" | "confirm";

const ROLE_REDIRECT: Record<Role, string> = {
  ADMIN: "/admin",
  AGENT: "/agent",
  CUSTOMER: "/customer",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>("login");
  const [verifyExpiresAt, setVerifyExpiresAt] = useState<string | null>(null);
  const [isSendingVerifyOtp, setIsSendingVerifyOtp] = useState(false);
  const [isLoginPasswordVisible, setIsLoginPasswordVisible] = useState(false);
  const [isResetPasswordVisible, setIsResetPasswordVisible] = useState(false);
  const [resetStep, setResetStep] = useState<ResetStep>("request");
  const [resetEmail, setResetEmail] = useState("");
  const [resetExpiresAt, setResetExpiresAt] = useState<string | null>(null);
  const [sendOtpEmail, setSendOtpEmail] = useState("");
  const [sendOtpExpiresAt, setSendOtpExpiresAt] = useState<string | null>(null);
  const [isResendingResetOtp, setIsResendingResetOtp] = useState(false);

  const {
    register,
    handleSubmit,
    formState,
    watch: watchLogin,
    setValue: setLoginValue,
  } = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
  });
  const loginEmailValue = watchLogin("email");

  const {
    register: registerVerify,
    handleSubmit: handleVerifySubmit,
    formState: verifyState,
    setValue: setVerifyValue,
    watch: watchVerifyForm,
    reset: resetVerifyForm,
  } = useForm<{ email: string; otp: string }>({
    defaultValues: { email: "", otp: "" },
  });
  const verifyFormEmail = watchVerifyForm("email");

  const {
    register: registerSendOtp,
    handleSubmit: handleSendOtpSubmit,
    formState: sendOtpState,
    reset: resetSendOtpForm,
  } = useForm<{ email: string }>({
    defaultValues: { email: "" },
  });

  const {
    register: registerResetRequest,
    handleSubmit: handleResetRequestSubmit,
    formState: resetRequestState,
    reset: resetResetRequestForm,
  } = useForm<{ email: string }>({
    defaultValues: { email: "" },
  });

  const {
    register: registerResetConfirm,
    handleSubmit: handleResetConfirmSubmit,
    formState: resetConfirmState,
    reset: resetResetConfirmForm,
  } = useForm<{ otp: string; newPassword: string }>({
    defaultValues: { otp: "", newPassword: "" },
  });

  const formatExpiry = (value: string | null) =>
    value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;

  const headerCopy: Record<Exclude<ActiveView, "reset">, { title: string; description: string }> = {
    login: {
      title: "Sign in",
      description: "Enter once, switch across courier workspaces instantly.",
    },
    verify: {
      title: "Verify OTP",
      description: "Confirm your email so we can route you to the right view.",
    },
    "send-otp": {
      title: "Send verification OTP",
      description: "Need a code without logging in? Fire one from here.",
    },
  };

  const resetCopy: Record<ResetStep, { title: string; description: string }> = {
    request: {
      title: "Forgot password?",
      description: "Send a reset OTP to reclaim access in under a minute.",
    },
    confirm: {
      title: "Enter reset OTP",
      description: "Use the code we mailed you to set a new password.",
    },
  };

  const badgeCopy: Record<ActiveView, string> = {
    login: "Courier access",
    verify: "Email verification",
    "send-otp": "OTP on demand",
    reset: resetStep === "confirm" ? "Reset confirmation" : "Password help",
  };

  const quickStats = [
    { label: "On-road", value: "86", meta: "+12 today" },
    { label: "Agents live", value: "24", meta: "All shifts" },
    { label: "Bookings", value: "1,240", meta: "98% SLA" },
  ];

  const highlights = [
    { icon: MapPin, title: "Live tracking", desc: "Watch pickups, drops, and rider pivots in real time." },
    { icon: ShieldCheck, title: "Role isolation", desc: "Admin, agent, and customers stay in their swim lanes." },
    { icon: TrendingUp, title: "Ops analytics", desc: "COD, SLA, and route drift surfaced instantly." },
  ];

  const opsPulse = [
    { time: "09:20", title: "4 pickups scheduled", desc: "North cluster" },
    { time: "11:00", title: "Agent shift change", desc: "Ops handoff ready" },
    { time: "14:45", title: "COD settlements", desc: "18 routes cleared" },
  ];

  const currentHeader = activeView === "reset" ? resetCopy[resetStep] : headerCopy[activeView];

  const openView = (view: ActiveView) => {
    if (view === "login") {
      setResetStep("request");
    }
    setActiveView(view);
    if (view === "verify") {
      const email = verifyFormEmail || loginEmailValue || "";
      setVerifyValue("email", email);
    }
    if (view === "send-otp") {
      resetSendOtpForm({ email: loginEmailValue || "" });
    }
    if (view === "reset") {
      setResetStep("request");
      setResetEmail("");
      setResetExpiresAt(null);
      resetResetRequestForm({ email: loginEmailValue || "" });
      resetResetConfirmForm({ otp: "", newPassword: "" });
    }
  };

  const supportOptions = [
    { label: "Forgot password", value: "reset" },
    { label: "Verify email", value: "verify" },
    { label: "Need OTP only", value: "send-otp" },
    ...(activeView !== "login" ? [{ label: "Back to login", value: "login" }] : []),
  ];

  const handleLogin = handleSubmit(async (values) => {
    try {
      const data = await runWithToast("Signing you in...", () => loginUser(values), {
        success: () => "Welcome back!",
      });
      if (!data) return;
      const role = (data.user.role ?? "CUSTOMER") as Role;
      login({
        token: data.accessToken,
        user: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          role,
        },
      });
      navigate(ROLE_REDIRECT[role] ?? "/", { replace: true });
    } catch (error: any) {
      const message = error?.response?.data?.message?.toLowerCase?.() ?? "";
      if (message.includes("verify")) {
        setActiveView("verify");
        setVerifyValue("email", values.email);
        setVerifyExpiresAt(null);
      }
    }
  });

  const onVerifyOtp = handleVerifySubmit(async ({ email, otp }) => {
    await runWithToast("Verifying OTP...", () => verifyOtp({ email, otp }), {
      success: () => "Email verified. Please sign in.",
    });
    setLoginValue("email", email);
    resetVerifyForm({ email, otp: "" });
    setActiveView("login");
  });

  const sendVerifyOtp = async () => {
    const email = verifyFormEmail?.trim();
    if (!email) return;
    setIsSendingVerifyOtp(true);
    try {
      const data = await runWithToast("Sending OTP...", () => resendOtp(email), {
        success: () => "OTP sent to your email.",
      });
      setVerifyExpiresAt(data.expiresAt ?? null);
    } finally {
      setIsSendingVerifyOtp(false);
    }
  };

  const onSendOtpOnly = handleSendOtpSubmit(async ({ email }) => {
    const data = await runWithToast("Sending OTP...", () => resendOtp(email), {
      success: () => "OTP sent to your inbox.",
    });
    setSendOtpEmail(email);
    setSendOtpExpiresAt(data.expiresAt ?? null);
  });

  const onResetRequest = handleResetRequestSubmit(async ({ email }) => {
    const data = await runWithToast("Sending reset OTP...", () => requestPasswordReset(email), {
      success: () => "OTP sent for password reset.",
    });
    setResetEmail(email);
    setResetStep("confirm");
    setResetExpiresAt(data.otpExpiresAt ?? null);
    resetResetConfirmForm({ otp: "", newPassword: "" });
  });

  const resendResetOtp = async () => {
    if (!resetEmail) return;
    setIsResendingResetOtp(true);
    try {
      const data = await runWithToast("Resending OTP...", () => requestPasswordReset(resetEmail), {
        success: () => "OTP resent.",
      });
      setResetExpiresAt(data.otpExpiresAt ?? null);
    } finally {
      setIsResendingResetOtp(false);
    }
  };

  const onResetConfirm = handleResetConfirmSubmit(async ({ otp, newPassword }) => {
    if (!resetEmail) return;
    await runWithToast("Updating password...", () => resetPassword({ email: resetEmail, otp, newPassword }), {
      success: () => "Password updated. You can sign in now.",
    });
    setLoginValue("email", resetEmail);
    setResetStep("request");
    setResetEmail("");
    setResetExpiresAt(null);
    setActiveView("login");
    resetResetRequestForm({ email: "" });
    resetResetConfirmForm({ otp: "", newPassword: "" });
  });

  return (
    <div
      className="min-h-dvh bg-cover bg-center bg-no-repeat px-4 py-6 lg:py-10"
      style={{ backgroundImage: `linear-gradient(120deg, rgba(6,95,70,0.15), rgba(15,23,42,0.25)), url(${loginBg})` }}
    >
      <main className="mx-auto grid w-full max-w-6xl gap-6 lg:min-h-[80dvh] lg:grid-cols-[1.05fr,0.95fr]">
        <MotionCard className="flex flex-col gap-5 rounded-[32px] border-none bg-white/90 p-6 shadow-[0_40px_130px_-70px_rgba(15,23,42,0.8)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary shadow-inner ring-1 ring-[hsl(var(--border))]">
                <img src="/logo.svg" alt={brandName} className="h-6 w-6" />
              </div>
              <div className="leading-tight">
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Courier portal</p>
                <p className="text-lg font-semibold text-foreground">{brandName}</p>
              </div>
            </div>
            <span className="rounded-full border border-[hsl(var(--border))] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
              99.95% uptime
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground">ParcelPulse workspace</h1>
            <p className="text-sm text-muted-foreground">
              Dispatch faster, track smoother, and keep agents and customers in sync—all within one short view.
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
              <p className="text-sm font-semibold text-foreground">Live features</p>
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
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Ops pulse
                <span className="text-muted-foreground">Today</span>
              </div>
              <div className="mt-4 space-y-3">
                {opsPulse.map((item) => (
                  <div key={item.time} className="rounded-2xl border border-white/60 bg-white/90 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{item.time}</p>
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
                {badgeCopy[activeView]}
              </span>
              <Select
                value=""
                placeholder="Support"
                options={supportOptions}
                onChange={(value) => openView(value as ActiveView)}
                className="w-[180px]"
              />
            </div>
            <div>
              <CardTitle className="text-3xl font-semibold text-foreground">{currentHeader.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{currentHeader.description}</p>
            </div>
          </CardHeader>
          <CardContent className="mt-6 flex-1 p-0">
            {activeView === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="name@email.com" {...register("email", { required: true })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={isLoginPasswordVisible ? "text" : "password"}
                      placeholder="********"
                      className="pr-11"
                      {...register("password", { required: true })}
                    />
                    <button
                      type="button"
                      onClick={() => setIsLoginPasswordVisible((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition hover:text-foreground"
                      aria-label={isLoginPasswordVisible ? "Hide password" : "Show password"}
                    >
                      {isLoginPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <MotionButton type="submit" className="w-full gap-2 rounded-2xl" disabled={formState.isSubmitting}>
                  {formState.isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Signing in
                    </>
                  ) : (
                    <>
                      Login <ArrowRight size={16} />
                    </>
                  )}
                </MotionButton>
                <div className="text-center text-sm text-muted-foreground">
                  <span>New here? </span>
                  <button type="button" className="underline" onClick={() => navigate("/register")}>
                    Create an account
                  </button>
                </div>
              </form>
            )}

            {activeView === "verify" && (
              <form onSubmit={onVerifyOtp} className="space-y-4">
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
                  {verifyFormEmail ? (
                    <>
                      OTP sent to <span className="font-semibold text-foreground">{verifyFormEmail}</span>.{" "}
                      {formatExpiry(verifyExpiresAt) ? `Expires around ${formatExpiry(verifyExpiresAt)}.` : "Expires in 5 minutes."}
                    </>
                  ) : (
                    "Enter the email that needs verification and we will send you an OTP."
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="verify-email">Email</Label>
                  <Input id="verify-email" type="email" placeholder="name@email.com" {...registerVerify("email", { required: true })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="verify-otp">One-time password</Label>
                  <Input
                    id="verify-otp"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    {...registerVerify("otp", { required: true, minLength: 6 })}
                  />
                </div>
                <MotionButton type="submit" className="w-full gap-2 rounded-2xl" disabled={verifyState.isSubmitting}>
                  {verifyState.isSubmitting ? (
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
                  className="w-full rounded-2xl"
                  onClick={sendVerifyOtp}
                  disabled={isSendingVerifyOtp || !verifyFormEmail}
                >
                  {isSendingVerifyOtp ? <Loader2 size={16} className="animate-spin" /> : verifyExpiresAt ? "Resend OTP" : "Send OTP"}
                </MotionButton>
                <div className="text-center text-sm text-muted-foreground">
                  <button type="button" className="underline" onClick={() => openView("login")}>
                    Back to sign in
                  </button>
                </div>
              </form>
            )}

            {activeView === "send-otp" && (
              <form onSubmit={onSendOtpOnly} className="space-y-4">
                {sendOtpEmail && (
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
                    OTP sent to <span className="font-semibold text-foreground">{sendOtpEmail}</span>.{" "}
                    {formatExpiry(sendOtpExpiresAt) ? `Expires around ${formatExpiry(sendOtpExpiresAt)}.` : "Expires in 5 minutes."}
                  </div>
                )}
                <div className="space-y-1">
                  <Label htmlFor="send-otp-email">Email</Label>
                  <Input id="send-otp-email" type="email" placeholder="name@email.com" {...registerSendOtp("email", { required: true })} />
                </div>
                <MotionButton type="submit" className="w-full gap-2 rounded-2xl" disabled={sendOtpState.isSubmitting}>
                  {sendOtpState.isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Send OTP"}
                </MotionButton>
                <div className="text-center text-sm text-muted-foreground">
                  <button type="button" className="underline" onClick={() => openView("login")}>
                    Back to sign in
                  </button>
                </div>
              </form>
            )}

            {activeView === "reset" && resetStep === "request" && (
              <form onSubmit={onResetRequest} className="space-y-4">
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
                  We will email a reset OTP and hold it for 10 minutes. Keep this tab handy.
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input id="reset-email" type="email" placeholder="name@email.com" {...registerResetRequest("email", { required: true })} />
                </div>
                <MotionButton type="submit" className="w-full gap-2 rounded-2xl" disabled={resetRequestState.isSubmitting}>
                  {resetRequestState.isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Send reset OTP"}
                </MotionButton>
                <div className="text-center text-sm text-muted-foreground">
                  <button type="button" className="underline" onClick={() => openView("login")}>
                    Back to sign in
                  </button>
                </div>
              </form>
            )}

            {activeView === "reset" && resetStep === "confirm" && (
              <form onSubmit={onResetConfirm} className="space-y-4">
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
                  OTP sent to <span className="font-semibold text-foreground">{resetEmail}</span>.{" "}
                  {formatExpiry(resetExpiresAt) ? `Expires around ${formatExpiry(resetExpiresAt)}.` : "Expires in 10 minutes."}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reset-otp">OTP</Label>
                  <Input
                    id="reset-otp"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    {...registerResetConfirm("otp", { required: true, minLength: 6 })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reset-password">New password</Label>
                  <div className="relative">
                    <Input
                      id="reset-password"
                      type={isResetPasswordVisible ? "text" : "password"}
                      placeholder="********"
                      className="pr-11"
                      {...registerResetConfirm("newPassword", { required: true, minLength: 6 })}
                    />
                    <button
                      type="button"
                      onClick={() => setIsResetPasswordVisible((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition hover:text-foreground"
                      aria-label={isResetPasswordVisible ? "Hide password" : "Show password"}
                    >
                      {isResetPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <MotionButton type="submit" className="w-full gap-2 rounded-2xl" disabled={resetConfirmState.isSubmitting || !resetEmail}>
                  {resetConfirmState.isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Update password"}
                </MotionButton>
                <MotionButton type="button" variant="secondary" className="w-full rounded-2xl" onClick={resendResetOtp} disabled={isResendingResetOtp}>
                  {isResendingResetOtp ? <Loader2 size={16} className="animate-spin" /> : "Resend reset OTP"}
                </MotionButton>
                <div className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
                  <button type="button" className="underline" onClick={() => setResetStep("request")}>
                    Use a different email
                  </button>
                  <button type="button" className="underline" onClick={() => openView("login")}>
                    Back to sign in
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
