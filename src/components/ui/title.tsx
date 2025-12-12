import * as React from "react";
import { cn } from "../../lib/utils";

export function PageTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground drop-shadow",
        className
      )}
      {...props}
    />
  );
}

export function SectionTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-foreground/90",
        className
      )}
      {...props}
    />
  );
}
