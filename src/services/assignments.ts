import { http } from "./http";
import type { AdminAssignmentsResponse, AgentAssignment, ApiResponse } from "./types";

export async function assign(parcelId: string, agentId: string) {
  const res = await http.post<ApiResponse<{ ok: true }>>(`/assignments`, { parcelId, agentId });
  return res.data.data;
}

export async function listAssignments() {
  const res = await http.get<ApiResponse<Array<{ id: string; parcelId: string; agentId: string; status: string }>>>("/assignments", {
    cache: { tags: ["assignments"], ttlMs: 30_000 },
  });
  return res.data.data;
}

export async function assignAgentAdmin(payload: { parcelId: string; agentId: string }) {
  const res = await http.post<ApiResponse<AgentAssignment>>("/admin/assign-agent", payload, {
    cache: { invalidateTags: ["adminParcels", "adminAssignments", "adminDashboardMetrics", `customerParcel:${payload.parcelId}`] },
  });
  return res.data;
}

export type ListAdminAssignmentsQuery = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  agentId?: string;
  parcelId?: string;
  searchTerm?: string;
  [key: string]: string | number | boolean | undefined;
};

export async function listAdminAssignments(params?: ListAdminAssignmentsQuery) {
  const res = await http.get<ApiResponse<AdminAssignmentsResponse>>("/admin/assignments", {
    params,
    cache: { tags: ["adminAssignments"], ttlMs: 30_000 },
  });
  return res.data.data;
}
