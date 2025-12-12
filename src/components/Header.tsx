import { LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import { brandName } from "../lib/brand";

export default function Header({ title }: { title: string }) {
  const { role, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[hsl(var(--border))] bg-white/90 backdrop-blur-xl shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)]">
      <div className="flex h-16 w-full items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary shadow-inner ring-1 ring-[hsl(var(--border))]">
            <img src="/logo.svg" alt={brandName} className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">{brandName}</p>
            <p className="text-lg font-semibold leading-tight text-foreground">{title} workspace</p>
          </div>
          <span className="hidden rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary-foreground sm:inline-flex">
            Glass UI
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">Role</span>
          <span className="rounded-full border border-[hsl(var(--border))] bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            {role ?? "guest"}
          </span>
          <Button size="sm" variant="secondary" className="gap-2" onClick={logout}>
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
