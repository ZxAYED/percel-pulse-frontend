import { http } from "./http";
import type { ApiResponse, ApiRole, User } from "./types";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: ApiRole;
};

export async function loginUser(payload: LoginPayload) {
  const res = await http.post<ApiResponse<{ user: User; accessToken: string }>>("/auth/login", payload, {
    cache: { invalidateTags: ["adminUsers", "users", "customerDashboardMetrics", "agentDashboardMetrics", "adminDashboardMetrics"] },
  });
  return res.data.data;
}

export async function registerUser(payload: RegisterPayload) {
  const res = await http.post<ApiResponse<{ user: User; otpSent: boolean; otpExpiresAt: string }>>("/auth/register", payload, {
    cache: { invalidateTags: ["adminUsers", "users"] },
  });
  return res.data.data;
}

export async function resendOtp(email: string) {
  const res = await http.post<ApiResponse<{ message: string; expiresAt: string }>>("/auth/resend-otp", { email });
  return res.data.data;
}

export async function verifyOtp(payload: { email: string; otp: string }) {
  const res = await http.post<ApiResponse<{ message: string }>>("/auth/verify-otp", payload);
  return res.data.data;
}

export async function requestPasswordReset(email: string) {
  const res = await http.post<ApiResponse<{ otpSent: boolean; otpExpiresAt: string }>>("/auth/request-reset-password", { email });
  return res.data.data;
}

export async function resetPassword(payload: { email: string; otp: string; newPassword: string }) {
  const res = await http.post<ApiResponse<{ message: string }>>("/auth/reset-password", payload);
  return res.data.data;
}

export async function changePassword(payload: { oldPassword: string; newPassword: string }) {
  const res = await http.post<ApiResponse<{ message: string }>>("/auth/change-password", payload);
  return res.data.data;
}
