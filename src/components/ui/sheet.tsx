import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

type SheetContextValue = { open: boolean; setOpen: (v: boolean) => void };
const SheetContext = React.createContext<SheetContextValue | null>(null);

export function Sheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(SheetContext)!;
  return (
    <div onClick={() => ctx.setOpen(true)}>{children}</div>
  );
}

export function SheetContent({
  children,
  className,
  side = "left",
}: {
  children: React.ReactNode;
  className?: string;
  side?: "left" | "right";
}) {
  const ctx = React.useContext(SheetContext)!;
  if (!ctx.open) return null;
  const fromX = side === "left" ? -320 : 320;
  const positionClass = side === "left" ? "left-0" : "right-0";
  return (
    <div className="fixed inset-0 z-50">
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => ctx.setOpen(false)}
      />
      <motion.aside
        initial={{ x: fromX }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className={cn(
          "absolute top-0 h-full w-72 border-r bg-background/95 p-4 backdrop-blur",
          positionClass,
          className
        )}
      >
        {children}
      </motion.aside>
    </div>
  );
}
