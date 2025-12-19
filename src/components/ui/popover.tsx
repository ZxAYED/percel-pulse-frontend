import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "../../lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = ({ className, align = "center", sideOffset = 4, ...props }: PopoverPrimitive.PopoverContentProps) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-2xl border border-[hsl(var(--border))] bg-white/95 p-4 text-foreground shadow-[0_20px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur focus:outline-none",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
);

export { Popover, PopoverContent, PopoverTrigger };
