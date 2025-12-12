import { motion } from "framer-motion";
import { LogOut, Menu } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { brandName } from "../lib/brand";
import { cn } from "../lib/utils";
import Sidebar from "./Sidebar";
import { MotionButton } from "./ui/motion";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { ADMIN_NAV, AGENT_NAV, CUSTOMER_NAV } from "../lib/navigation";

export default function Navbar() {
  const { logout, role } = useAuth();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const switchLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const navItems = role === "admin" ? ADMIN_NAV : role === "agent" ? AGENT_NAV : CUSTOMER_NAV;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[hsl(var(--border))] bg-white/90 backdrop-blur-xl shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)]">
      <div className="flex h-16 w-full items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <motion.div
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary shadow-inner ring-1 ring-[hsl(var(--border))]"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.img src="/logo.svg" alt={brandName} className="h-6 w-6" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} />
          </motion.div>
          <div className="leading-tight">
            <motion.p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
              {brandName}
            </motion.p>
            <motion.p className="text-lg font-semibold text-foreground" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
              Courier workspace
            </motion.p>
          </div>
          <span className="hidden rounded-full border border-[hsl(var(--border))] bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary sm:inline-flex">
            {role ?? "guest"}
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger>
              <MotionButton variant="ghost" size="sm" className="gap-2 rounded-xl border border-[hsl(var(--border))] bg-white text-foreground shadow-sm hover:bg-secondary lg:hidden">
                <Menu size={16} /> Menu
              </MotionButton>
            </SheetTrigger>
            <SheetContent side="right" className="border-l border-[hsl(var(--border))] bg-white/90 text-foreground backdrop-blur-xl">
              <Sidebar />
            </SheetContent>
          </Sheet>
          {navItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "text-sm",
                  isActive ? "text-primary" : "text-foreground/80"
                )
              }
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
          <div className="hidden items-center gap-1 rounded-xl border border-[hsl(var(--border))] bg-white px-2 py-1 text-sm font-semibold text-foreground shadow-sm sm:flex">
            <button
              type="button"
              onClick={() => switchLanguage("en")}
              className={cn("px-2 py-1 rounded-lg", i18n.language === "en" && "bg-secondary text-primary")}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => switchLanguage("bn")}
              className={cn("px-2 py-1 rounded-lg", i18n.language === "bn" && "bg-secondary text-primary")}
            >
              BN
            </button>
          </div>
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
        </nav>
      </div>
    </header>
  );
}
