import { motion, type MotionProps } from "framer-motion";
import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { buttonVariants } from "./button-variants";

type MotionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> &
  MotionProps;

export function MotionButton({ className, variant, size, ...props }: MotionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

type MotionCardProps = React.HTMLAttributes<HTMLDivElement> & MotionProps;

export function MotionCard({ className, ...props }: MotionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white text-card-foreground shadow-[0_18px_60px_-40px_rgba(15,23,42,0.45)]",
        className
      )}
      {...props}
    />
  );
}
