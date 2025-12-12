import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { brandName } from "../lib/brand";
import { ADMIN_NAV, AGENT_NAV, CUSTOMER_NAV } from "../lib/navigation";
import { cn } from "../lib/utils";

export default function Sidebar() {
  const { role } = useAuth();
  const items = role === "admin" ? ADMIN_NAV : role === "agent" ? AGENT_NAV : CUSTOMER_NAV;
  const { t } = useTranslation();
  return (
    <aside className="relative flex w-72 flex-col gap-2 overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-white p-4 shadow-[0_18px_60px_-44px_rgba(15,23,42,0.35)] lg:fixed lg:left-6 lg:top-24 lg:h-[calc(100vh-7rem)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-slate-100" aria-hidden />
      <div className="relative flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shadow-inner">
            <img src="/logo.svg" alt={brandName} className="h-10 w-8" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Control</p>
            <p className="text-base md:text-xl font-semibold">{brandName}</p>
          </div>
        </div>
      
      </div>
      <nav className="relative mt-4 flex space-y-4 flex-1 flex-col gap-1">
        {items.map(({ to, label, icon: Icon, i18nKey }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3 md:text-lg text-base font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary via-emerald-500 to-emerald-400 text-white shadow-[0_16px_40px_-24px_rgba(16,185,129,0.65)]"
                  : "text-foreground/80 hover:-translate-y-[1px] hover:bg-secondary hover:text-foreground"
              )
            }
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl ">
              <Icon size={18} />
            </span>
            <span>{t(`nav.${i18nKey ?? label.toLowerCase().replace(/[^a-z]/gi, "")}`, { defaultValue: label })}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
