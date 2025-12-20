import * as React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type TextFieldProps = React.ComponentProps<typeof Input> & {
  label: string;
  error?: string;
  hint?: string;
};

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(({ id, label, error, hint, ...props }, ref) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input ref={ref} id={id} {...props} />
    {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    {error ? <p className="text-xs text-rose-600">{error}</p> : null}
  </div>
));

TextField.displayName = "TextField";
