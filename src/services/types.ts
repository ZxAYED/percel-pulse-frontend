export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type Parcel = {
  id: string;
  status: "Picked Up" | "In Transit" | "Delivered" | "Failed";
  cod?: number;
  customerName?: string;
};

export type ApiRole = "ADMIN" | "AGENT" | "CUSTOMER";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: ApiRole;
};
