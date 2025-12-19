import { http } from "./http";
import type { ApiResponse, Paginated, Parcel } from "./types";

export async function listParcels(params?: { page?: number; pageSize?: number; status?: Parcel["status"] }) {
  const res = await http.get<ApiResponse<Paginated<Parcel>>>("/parcels", { params });
  return res.data.data;
}

export async function createParcel(payload: Omit<Parcel, "id"> & { customerId: string }) {
  const res = await http.post<ApiResponse<Parcel>>("/parcels", payload);
  return res.data.data;
}

export async function updateParcel(id: string, payload: Partial<Parcel>) {
  const res = await http.put<ApiResponse<Parcel>>(`/parcels/${id}`, payload);
  return res.data.data;
}

export async function assignAgent(parcelId: string, agentId: string) {
  const res = await http.post<ApiResponse<{ ok: true }>>(`/parcels/${parcelId}/assign`, { agentId });
  return res.data.data;
}

