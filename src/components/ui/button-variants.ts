import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-base font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary via-emerald-500 to-emerald-400 text-primary-foreground shadow-[0_14px_40px_-22px_rgba(16,185,129,0.6)] hover:brightness-105",
        secondary:
          "border border-[hsl(var(--border))] bg-white text-foreground hover:bg-secondary",
        outline:
          "border border-[hsl(var(--border))] bg-transparent text-foreground hover:bg-secondary",
        ghost: "text-foreground hover:bg-secondary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-7 py-3",
        sm: "h-10 rounded-xl px-4",
        lg: "h-12 rounded-xl px-8 py-3 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
