import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import { Fragment } from "react";
import { cn } from "../../lib/utils";

export type SelectOption = { label: string; value: string };

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
};

export function Select({ value, onChange, options, placeholder = "Select", className }: SelectProps) {
  const current = options.find((o) => o.value === value);
  return (
    <Listbox value={value} onChange={onChange}>
      <div className={cn("relative", className)}>
        <Listbox.Button
          className="relative w-full cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-2.5 text-left text-sm text-foreground shadow-sm transition hover:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <span className="block truncate">{current?.label ?? placeholder}</span>
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </span>
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-white py-1 text-sm shadow-lg focus:outline-none">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active }) =>
                  cn(
                    "relative cursor-pointer select-none px-4 py-2",
                    active ? "bg-primary/10 text-primary" : "text-foreground"
                  )
                }
              >
                {({ selected }) => (
                  <>
                    <span className={cn("block truncate", selected ? "font-semibold" : "font-normal")}>{option.label}</span>
                    {selected ? <Check className="absolute inset-y-0 right-3 h-4 w-4 text-primary" /> : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
