import { http } from "./http";
import type { AdminUser, AdminUsersResponse, ApiResponse, Paginated, User } from "./types";

export async function listUsers(params?: { page?: number; pageSize?: number; role?: User["role"] }) {
  const res = await http.get<ApiResponse<Paginated<User>>>("/users", { params, cache: { tags: ["users"], ttlMs: 30_000 } });
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

export type ListAdminUsersQuery = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
  role?: User["role"];
  isActive?: boolean;
  isVerified?: boolean;
  email?: string;
  phone?: string;
  [key: string]: string | number | boolean | undefined;
};

export async function listAdminUsers(params?: ListAdminUsersQuery) {
  const res = await http.get<ApiResponse<AdminUsersResponse<AdminUser>>>("/admin/users", { params, cache: { tags: ["adminUsers"], ttlMs: 30_000 } });
  return res.data.data;
}
