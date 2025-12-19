import { http } from "./http";
import type { ApiResponse } from "./types";

export async function metrics() {
  const res = await http.get<ApiResponse<{ bookings: number; delivered: number; failed: number; cod: number }>>("/reports/metrics");
  return res.data.data;
}

