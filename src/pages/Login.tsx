import { motion } from "framer-motion";
import { ArrowRight, Ellipsis, Loader2, MapPin, ShieldCheck, TrendingUp, Truck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import loginBg from "../assets/login.png";
import { Button } from "../components/ui/button";
import { CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { MotionButton, MotionCard } from "../components/ui/motion";
import { PageTitle } from "../components/ui/title";
import { useAuth } from "../hooks/useAuth";
import { brandName } from "../lib/brand";
import { runWithToast } from "../lib/utils";
import { loginUser, requestPasswordReset, resendOtp, resetPassword, verifyOtp } from "../services/auth";
import type { Role } from "../context/AuthContextBase";

type LoginForm = { email: string; password: string };
type ActiveView = "login" | "verify" | "reset" | "send-otp";
type ResetStep = "request" | "confirm";

const ROLE_REDIRECT: Record<Role, string> = {
  admin: "/admin",
  agent: "/agent",
  customer: "/customer",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>("login");
  const [verifyExpiresAt, setVerifyExpiresAt] = useState<string | null>(null);
  const [isSendingVerifyOtp, setIsSendingVerifyOtp] = useState(false);
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
      description: "Manage bookings, tracking, and agent coordination from one login.",
    },
    verify: {
      title: "Verify OTP",
      description: "Confirm your email with the 6-digit code we emailed you.",
    },
    "send-otp": {
      title: "Send verification OTP",
      description: "Trigger a fresh OTP for your email without going back to registration.",
    },
  };

  const resetCopy: Record<ResetStep, { title: string; description: string }> = {
    request: {
      title: "Forgot password?",
      description: "Request a password reset OTP and get back into your workspace.",
    },
    confirm: {
      title: "Enter reset OTP",
      description: "Use the OTP we sent to set a new password.",
    },
  };

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

  const handleLogin = handleSubmit(async (values) => {
    try {
      const data = await runWithToast("Signing you in...", () => loginUser(values), {
        success: () => "Welcome back!",
      });
      if (!data) return;
      const role = (data.user.role?.toLowerCase() ?? "customer") as Role;
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
      navigate(ROLE_REDIRECT[role] ?? "/dashboard", { replace: true });
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
              { label: "Today's bookings", value: "1,240" },
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
          <CardHeader className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-semibold text-foreground">{currentHeader.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{currentHeader.description}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="gap-2 rounded-full px-4">
                    <Ellipsis size={16} /> Support
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => openView("verify")}>Verify email</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => openView("send-otp")}>Send verification OTP</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => openView("reset")}>Forgot password</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => openView("login")}>Back to login</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {activeView === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="name@email.com" {...register("email", { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="********" {...register("password", { required: true })} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="text-primary underline-offset-2 hover:underline"
                    onClick={() => openView("reset")}
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    className="text-muted-foreground underline-offset-2 hover:underline"
                    onClick={() => openView("verify")}
                  >
                    Verify email
                  </button>
                </div>
                <MotionButton type="submit" className="w-full gap-2" disabled={formState.isSubmitting}>
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
              <form onSubmit={onVerifyOtp} className="space-y-5">
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary/60 p-4 text-sm text-muted-foreground">
                  {verifyFormEmail ? (
                    <>
                      We sent a verification OTP to <span className="font-semibold text-foreground">{verifyFormEmail}</span>.{" "}
                      {formatExpiry(verifyExpiresAt) ? `Expires around ${formatExpiry(verifyExpiresAt)}.` : "Expires in 5 minutes."}
                    </>
                  ) : (
                    "Enter the email that needs verification and we will send you an OTP."
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verify-email">Email</Label>
                  <Input
                    id="verify-email"
                    type="email"
                    placeholder="name@email.com"
                    {...registerVerify("email", { required: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verify-otp">One-time password</Label>
                  <Input
                    id="verify-otp"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    {...registerVerify("otp", { required: true, minLength: 6 })}
                  />
                </div>
                <MotionButton type="submit" className="w-full gap-2" disabled={verifyState.isSubmitting}>
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
                  className="w-full"
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
              <form onSubmit={onSendOtpOnly} className="space-y-5">
                {sendOtpEmail && (
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary/60 p-4 text-sm text-muted-foreground">
                    Verification OTP sent to <span className="font-semibold text-foreground">{sendOtpEmail}</span>.{" "}
                    {formatExpiry(sendOtpExpiresAt) ? `Expires around ${formatExpiry(sendOtpExpiresAt)}.` : "Expires in 5 minutes."}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="send-otp-email">Email</Label>
                  <Input
                    id="send-otp-email"
                    type="email"
                    placeholder="name@email.com"
                    {...registerSendOtp("email", { required: true })}
                  />
                </div>
                <MotionButton type="submit" className="w-full gap-2" disabled={sendOtpState.isSubmitting}>
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
              <form onSubmit={onResetRequest} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="name@email.com"
                    {...registerResetRequest("email", { required: true })}
                  />
                </div>
                <MotionButton type="submit" className="w-full gap-2" disabled={resetRequestState.isSubmitting}>
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
              <form onSubmit={onResetConfirm} className="space-y-5">
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary/60 p-4 text-sm text-muted-foreground">
                  Reset OTP sent to <span className="font-semibold text-foreground">{resetEmail}</span>.{" "}
                  {formatExpiry(resetExpiresAt) ? `Expires around ${formatExpiry(resetExpiresAt)}.` : "Expires in 10 minutes."}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-otp">OTP</Label>
                  <Input
                    id="reset-otp"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    {...registerResetConfirm("otp", { required: true, minLength: 6 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-password">New password</Label>
                  <Input
                    id="reset-password"
                    type="password"
                    placeholder="********"
                    {...registerResetConfirm("newPassword", { required: true, minLength: 6 })}
                  />
                </div>
                <MotionButton type="submit" className="w-full gap-2" disabled={resetConfirmState.isSubmitting || !resetEmail}>
                  {resetConfirmState.isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Update password"}
                </MotionButton>
                <MotionButton
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={resendResetOtp}
                  disabled={isResendingResetOtp}
                >
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
      </div>
    </div>
  );
}
