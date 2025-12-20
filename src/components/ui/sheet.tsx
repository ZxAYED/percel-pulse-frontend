import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

type SheetContextValue = { open: boolean; setOpen: (v: boolean) => void };
const SheetContext = React.createContext<SheetContextValue | null>(null);

type SheetProps = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Sheet({ children, open: openProp, onOpenChange }: SheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? !!openProp : internalOpen;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  const contextValue = React.useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return <SheetContext.Provider value={contextValue}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(SheetContext)!;
  return <div onClick={() => ctx.setOpen(true)}>{children}</div>;
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
  const asideRef = React.useRef<HTMLElement | null>(null);

  if (!ctx.open) return null;
  const fromX = side === "left" ? -320 : 320;
  const justifyClass = side === "left" ? "justify-start" : "justify-end";

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-end lg:hidden">
      <motion.div
        className="absolute inset-0 bg-black/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => ctx.setOpen(false)}
      />
      <div className={cn("relative flex h-full w-full", justifyClass)}>
        <motion.aside
          ref={asideRef}
          initial={{ x: fromX }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className={cn(
            "relative z-10 my-2 h-[calc(100vh-16px)] w-[calc(100vw-24px)] max-w-64 overflow-hidden rounded-l-3xl bg-white p-0 shadow-2xl backdrop-blur",
            side === "left" ? "rounded-r-3xl rounded-l-none" : "",
            className
          )}
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </motion.aside>
      </div>
    </div>
  );
}
