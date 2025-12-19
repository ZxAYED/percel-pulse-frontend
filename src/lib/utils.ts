import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getToastMessage(input: unknown): string | undefined {
  if (typeof input === "string") {
    const msg = input.trim();
    return msg ? msg : undefined;
  }

  const maybeMessage =
    (input as any)?.response?.data?.message ?? (input as any)?.data?.message ?? (input as any)?.message ?? undefined;

  if (typeof maybeMessage === "string") {
    const msg = maybeMessage.trim();
    return msg ? msg : undefined;
  }

  return undefined;
}

export function toastSuccess(input?: unknown, fallback = "Success", opts?: Parameters<typeof toast.success>[1]) {
  const msg = getToastMessage(input) ?? fallback;
  toast.success(msg, opts);
}

export function toastError(input?: unknown, fallback = "Failed", opts?: Parameters<typeof toast.error>[1]) {
  const msg = getToastMessage(input) ?? fallback;
  toast.error(msg, opts);
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
    const msg =
      typeof opts?.success === "function"
        ? opts.success(data)
        : getToastMessage(data) ?? opts?.success ?? "Success";
    toastSuccess(msg, "Success", { id });
    return data;
  } catch (err: any) {
    const backendMsg = getToastMessage(err);
    const msg = typeof opts?.error === "function" ? opts.error(err) : backendMsg ?? opts?.error ?? "Failed";
    toastError(msg, "Failed", { id });
    throw err;
  }
}
