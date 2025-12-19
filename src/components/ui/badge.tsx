import * as React from "react";
import { cn } from "../../lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "solid" | "outline";
};

export function Badge({ className, variant = "solid", ...props }: BadgeProps) {
  const base =
    variant === "solid"
      ? "inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white"
      : "inline-flex items-center rounded-full border border-[hsl(var(--border))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground";
  return <span className={cn(base, className)} {...props} />;
}
