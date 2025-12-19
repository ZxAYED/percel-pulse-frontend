import { http } from "./http";
import type { ApiResponse, Paginated, User } from "./types";

export async function listUsers(params?: { page?: number; pageSize?: number; role?: User["role"] }) {
  const res = await http.get<ApiResponse<Paginated<User>>>("/users", { params });
  return res.data.data;
}

export async function createUser(payload: { name: string; email: string; role: User["role"] }) {
  const res = await http.post<ApiResponse<User>>("/users", payload);
  return res.data.data;
}

export async function updateUser(id: string, payload: Partial<User>) {
  const res = await http.put<ApiResponse<User>>(`/users/${id}`, payload);
  return res.data.data;
}

