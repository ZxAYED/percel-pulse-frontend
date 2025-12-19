import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function runWithToast<T>(
  loading: string,
  runner: () => Promise<T>,
  opts?: {
    success?: string | ((data: T) => string);
    error?: string | ((err: any) => string);
  }
) {
  const id = toast.loading(loading);
  try {
    const data = await runner();
    const msg = typeof opts?.success === "function" ? opts.success(data) : opts?.success ?? "Success";
    toast.success(msg, { id });
    return data;
  } catch (err: any) {
    const fallback = err?.response?.data?.message ?? "Failed";
    const msg = typeof opts?.error === "function" ? opts.error(err) : opts?.error ?? fallback;
    toast.error(msg, { id });
    throw err;
  }
}
