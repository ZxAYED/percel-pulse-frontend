import { CalendarDays } from "lucide-react";
import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type DateTimeFieldProps = {
  id: string;
  label: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
};

export function DateTimeField({ id, label, value, onChange, onBlur, error }: DateTimeFieldProps) {
  const dateValue = value ? new Date(value) : undefined;
  const displayDate = dateValue
    ? dateValue.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    : "Pick a date";
  const timeValue = dateValue ? dateValue.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }) : "";

  const handleDateSelect = (selected?: Date) => {
    if (!selected) return;
    const base = new Date(selected);
    if (dateValue) {
      base.setHours(dateValue.getHours(), dateValue.getMinutes(), 0, 0);
    } else {
      base.setHours(9, 0, 0, 0);
    }
    onChange(base.toISOString());
    onBlur?.();
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = event.target.value;
    if (!nextTime) {
      onChange("");
      onBlur?.();
      return;
    }
    const [hour, minute] = nextTime.split(":").map((part) => Number(part));
    const base = dateValue ? new Date(dateValue) : new Date();
    base.setHours(Number.isFinite(hour) ? hour : 0, Number.isFinite(minute) ? minute : 0, 0, 0);
    onChange(base.toISOString());
    onBlur?.();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="flex w-full items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-left font-normal"
          >
            <span className="text-sm text-foreground">{displayDate}</span>
            <CalendarDays size={16} className="text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="rounded-[24px]">
          <Calendar mode="single" selected={dateValue} onSelect={handleDateSelect} />
        </PopoverContent>
      </Popover>
      <Input
        id={`${id}-time`}
        type="time"
        value={timeValue}
        onChange={handleTimeChange}
        aria-label={`${label} time`}
      />
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
