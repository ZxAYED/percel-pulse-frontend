import { type VariantProps } from "class-variance-authority";
import { motion } from 'framer-motion';
import * as React from "react";
import { cn } from "../../lib/utils";
import { buttonVariants } from "./button-variants";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      
    <motion.div 
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.8 }}
    >
        <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    </motion.div>
    );
  }
);
Button.displayName = "Button";

export { Button };

