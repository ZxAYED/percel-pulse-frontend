import "react-day-picker/dist/style.css";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { cn } from "../../lib/utils";

export type CalendarProps = DayPickerProps;

export function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays
      fixedWeeks
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-4",
        caption: "flex items-center justify-between px-1",
        caption_label: "text-sm font-semibold tracking-wide text-foreground",
        nav: "flex items-center gap-2",
        nav_button:
          "h-7 w-7 rounded-full border border-[hsl(var(--border))] text-muted-foreground hover:bg-secondary focus:outline-none focus:ring",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "w-9 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground",
        row: "flex",
        cell: "relative mx-1 my-1 flex h-9 w-9 items-center justify-center rounded-full text-sm focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 rounded-full p-0 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/40",
          "hover:bg-primary/10 hover:text-primary"
        ),
        day_selected: "bg-primary text-white hover:bg-primary/90 hover:text-white",
        day_today: "text-primary-foreground border border-primary/40",
        day_disabled: "text-muted-foreground/50 opacity-50",
      }}
      {...props}
    />
  );
}
