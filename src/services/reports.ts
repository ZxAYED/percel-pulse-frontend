import { http } from "./http";
import type { AdminDashboardMetrics, AgentDashboardMetrics, ApiResponse, CustomerDashboardMetrics } from "./types";

export async function metrics() {
  const res = await http.get<ApiResponse<{ bookings: number; delivered: number; failed: number; cod: number }>>("/reports/metrics", {
    cache: { tags: ["reportsMetrics"], ttlMs: 30_000 },
  });
  return res.data.data;
}

export async function adminDashboardMetrics() {
  const res = await http.get<ApiResponse<AdminDashboardMetrics>>("/admin/dashboard/metrics", {
    cache: { tags: ["adminDashboardMetrics"], ttlMs: 15_000 },
  });
  return res.data.data;
}

export async function customerDashboardMetrics() {
  const res = await http.get<ApiResponse<CustomerDashboardMetrics>>("/customer/dashboard/metrics", {
    cache: { tags: ["customerDashboardMetrics"], ttlMs: 15_000 },
  });
  return res.data.data;
}

export async function agentDashboardMetrics() {
  const res = await http.get<ApiResponse<AgentDashboardMetrics>>("/agent/dashboard/metrics", {
    cache: { tags: ["agentDashboardMetrics"], ttlMs: 15_000 },
  });
  return res.data.data;
}

function getFilename(contentDisposition: string | undefined | null) {
  if (!contentDisposition) return null;
  const star = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(contentDisposition);
  if (star?.[1]) return decodeURIComponent(star[1].trim().replace(/^"|"$/g, ""));
  const plain = /filename\s*=\s*([^;]+)/i.exec(contentDisposition);
  if (plain?.[1]) return plain[1].trim().replace(/^"|"$/g, "");
  return null;
}

async function downloadAdminExport(path: string, params: Record<string, unknown> | undefined, fallbackFilename: string) {
  const res = await http.get<Blob>(path, { params, responseType: "blob" });
  const filename = getFilename((res.headers as Record<string, string | undefined>)["content-disposition"]) ?? fallbackFilename;
  return { blob: res.data, filename };
}

export type ExportAdminParcelsQuery = {
  searchTerm?: string;
  trackingNumber?: string;
  referenceCode?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  status?: string;
  paymentType?: string;
  paymentStatus?: string;
};

export async function exportAdminParcelsCsv(params?: ExportAdminParcelsQuery) {
  return downloadAdminExport("/admin/export/parcels/csv", params, "parcels.csv");
}

export async function exportAdminParcelsPdf(params?: ExportAdminParcelsQuery) {
  return downloadAdminExport("/admin/export/parcels/pdf", params, "parcels.pdf");
}

export type ExportAdminUsersQuery = {
  searchTerm?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
};

export async function exportAdminUsersCsv(params?: ExportAdminUsersQuery) {
  return downloadAdminExport("/admin/export/users/csv", params, "users.csv");
}

export async function exportAdminUsersPdf(params?: ExportAdminUsersQuery) {
  return downloadAdminExport("/admin/export/users/pdf", params, "users.pdf");
}

export async function exportAdminParcelCsv(params: { parcelId?: string; trackingNumber?: string }) {
  return downloadAdminExport("/admin/export/parcel/csv", params, "parcel.csv");
}

export async function exportAdminParcelPdf(params: { parcelId?: string; trackingNumber?: string }) {
  return downloadAdminExport("/admin/export/parcel/pdf", params, "parcel.pdf");
}
