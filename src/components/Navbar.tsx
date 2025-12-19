import { motion } from "framer-motion";
import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { brandName } from "../lib/brand";
import { ADMIN_NAV, AGENT_NAV, CUSTOMER_NAV } from "../lib/navigation";
import { cn } from "../lib/utils";
import { MotionButton } from "./ui/motion";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export default function Navbar() {
  const { logout, role, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n, t } = useTranslation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const userName = user?.name ?? "Guest user";
  const userEmail = user?.email ?? "Not signed in";
  const userInitials = (user?.name?.trim() || user?.email?.trim() || "GU")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    document.body.style.overflow = isSheetOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSheetOpen]);

  useEffect(() => {
    setIsSheetOpen(false);
  }, [location.pathname]);

  const navItems = role === "ADMIN" ? ADMIN_NAV : role === "AGENT" ? AGENT_NAV : CUSTOMER_NAV;
  const homeTo = role === "ADMIN" ? "/admin" : role === "AGENT" ? "/agent" : "/customer";

  return (
    <header className="sticky top-0 w-full border-b border-[hsl(var(--border))] bg-white/90 py-2 z-50 backdrop-blur-xl shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)]">
      <div className="flex h-16 w-full items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <motion.div
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary shadow-inner ring-1 ring-[hsl(var(--border))]"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.img src="/logo.svg" alt={brandName} className="h-6 w-6" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} />
          </motion.div>
          <div className="leading-tight flex md:flex-col justify-center items-start">
            <motion.p className="text-[11px] hidden md:block uppercase tracking-[0.28em] text-muted-foreground" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
              {brandName}
            </motion.p>
            <motion.p className="md:text-lg md:font-semibold text-nowrap text-foreground" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
              Courier workspace
            </motion.p>
          </div>
          <span className="hidden rounded-full border border-[hsl(var(--border))] bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary sm:inline-flex">
            {role ?? "guest"}
          </span>
        </Link>
        <nav className="flex items-center gap-2 ml-2">
          <div className="lg:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger>
                <MotionButton variant="ghost" size="sm" className="gap-2 rounded-xl bg-secondary text-foreground shadow-sm hover:bg-secondary/80">
                  <Menu size={16} /> Menu
                </MotionButton>
              </SheetTrigger>
              <SheetContent side="right" className="rounded-l-3xl border-none shadow-2xl z-50">
                <div className="flex   z-50 h-full flex-col bg-white">
                  <div className="flex items-center justify-between px-4 pb-3 pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shadow-inner">
                        <motion.img src="/logo.svg" alt={brandName} className="h-8 w-7" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{t("nav.menu", { defaultValue: "Menu" })}</p>
                        <p className="text-base font-semibold text-foreground">{brandName}</p>
                      </div>
                    </div>
                    <MotionButton
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-lg text-foreground hover:bg-secondary"
                      aria-label={t("actions.close", { defaultValue: "Close" })}
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <X size={18} />
                    </MotionButton>
                  </div>
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-secondary/70 px-4 py-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-base font-semibold uppercase text-primary">
                        {userInitials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{userName}</p>
                        <p className="text-xs text-muted-foreground">{userEmail}</p>
                      </div>
                    </div>
                  </div>
                  <nav className="flex-1 overflow-y-auto px-2 pb-4">
                    {navItems.map(({ to, label, icon: Icon, i18nKey }) => (
                      <NavLink
                        key={to}
                        to={to}
                        end={to === homeTo}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                            isActive ? "bg-primary text-white shadow-[0_16px_34px_-22px_rgba(16,185,129,0.65)]" : "text-foreground/80 hover:bg-secondary"
                          )
                        }
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <Icon size={18} />
                        <span>{t(`nav.${i18nKey ?? label.toLowerCase().replace(/[^a-z]/gi, "")}`, { defaultValue: label })}</span>
                      </NavLink>
                    ))}
                  </nav>
                  <div className="mt-auto space-y-3 px-4 pb-6 pt-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <button
                        type="button"
                        onClick={() => i18n.changeLanguage("en")}
                        className={cn(
                          "rounded-lg px-3 py-2 text-foreground/80 transition-colors hover:bg-secondary",
                          i18n.language === "en" && "bg-secondary text-primary"
                        )}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        onClick={() => i18n.changeLanguage("bn")}
                        className={cn(
                          "rounded-lg px-3 py-2 text-foreground/80 transition-colors hover:bg-secondary",
                          i18n.language === "bn" && "bg-secondary text-primary"
                        )}
                      >
                        BN
                      </button>
                    </div>
                    <MotionButton
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80"
                      onClick={() => {
                        logout();
                        navigate("/login");
                        setIsSheetOpen(false);
                      }}
                    >
                      <LogOut size={16} /> {t("actions.logout", { defaultValue: "Logout" })}
                    </MotionButton>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            {navItems.slice(0, 4).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === homeTo}
                className={({ isActive }) => cn("text-sm", isActive ? "text-primary" : "text-foreground/80")}
              >
                {({ isActive }) => (
                  <MotionButton
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-2 rounded-xl border border-transparent bg-transparent text-foreground hover:bg-secondary",
                      isActive && "border-[hsl(var(--border))] bg-white shadow-sm text-primary"
                    )}
                  >
                    <item.icon size={16} /> {t(`nav.${item.i18nKey ?? item.label.toLowerCase()}`, { defaultValue: item.label })}
                  </MotionButton>
                )}
              </NavLink>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-white px-3 py-2 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-sm font-semibold uppercase text-primary">
              {userInitials}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground max-w-[180px] truncate" title={userEmail}>
                {userEmail}
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-1 rounded-xl border border-[hsl(var(--border))] bg-white px-2 py-1 text-sm font-semibold text-foreground shadow-sm sm:flex">
            <button
              type="button"
              onClick={() => i18n.changeLanguage("en")}
              className={cn("px-2 py-1 rounded-lg", i18n.language === "en" && "bg-secondary text-primary")}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => i18n.changeLanguage("bn")}
              className={cn("px-2 py-1 rounded-lg", i18n.language === "bn" && "bg-secondary text-primary")}
            >
              BN
            </button>
          </div>
          <div className="hidden lg:block">
            <MotionButton
              variant="secondary"
              size="sm"
              className="gap-2 rounded-xl shadow-sm"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut size={16} /> {t("actions.logout", { defaultValue: "Logout" })}
            </MotionButton>
          </div>
        </nav>
      </div>
    </header>
  );
}
