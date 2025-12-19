import { http } from "./http";
import type { ApiResponse } from "./types";

export async function assign(parcelId: string, agentId: string) {
  const res = await http.post<ApiResponse<{ ok: true }>>(`/assignments`, { parcelId, agentId });
  return res.data.data;
}

export async function listAssignments() {
  const res = await http.get<ApiResponse<Array<{ id: string; parcelId: string; agentId: string; status: string }>>>("/assignments");
  return res.data.data;
}

