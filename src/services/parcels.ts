import { http } from "./http";
import type {
  AdminParcel,
  AdminParcelsResponse,
  ApiResponse,
  CustomerParcelDetails,
  CustomerParcelListItem,
  CustomerParcelsResponse,
  Paginated,
  Parcel,
  ParcelStatus,
  PaymentStatus,
  PaymentType,
  TrackingPoint,
} from "./types";

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

export type ListAdminParcelsQuery = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
  trackingNumber?: string;
  referenceCode?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  status?: ParcelStatus;
  paymentType?: PaymentType;
  paymentStatus?: PaymentStatus;
  [key: string]: string | number | boolean | undefined;
};

export async function listAdminParcels(params?: ListAdminParcelsQuery) {
  const res = await http.get<ApiResponse<AdminParcelsResponse<AdminParcel>>>("/admin/parcels", { params });
  return res.data.data;
}

export type UpdateAdminParcelStatusPayload = {
  parcelId: string;
  status: ParcelStatus;
  remarks?: string;
};

export type UpdateAdminParcelStatusResponse = Pick<AdminParcel, "id" | "trackingNumber" | "status" | "deliveredAt" | "failedAt" | "updatedAt" | "customer">;

export async function updateAdminParcelStatus(payload: UpdateAdminParcelStatusPayload) {
  const res = await http.post<ApiResponse<UpdateAdminParcelStatusResponse>>("/admin/update-parcel-status", payload);
  return res.data.data;
}

export type CustomerBookParcelPayload = {
  pickupAddress: string;
  deliveryAddress: string;
  referenceCode: string;
  parcelType: string;
  parcelSize: string;
  weightKg: number;
  instructions: string;
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  paymentType: PaymentType;
  codAmount?: number;
  expectedPickupAt: string;
  expectedDeliveryAt: string;
  qrCodeUrl?: string;
  barcode?: string;
};

export async function bookCustomerParcel(payload: CustomerBookParcelPayload) {
  if (payload.paymentType === "COD" && (payload.codAmount === undefined || payload.codAmount === null)) {
    throw new Error("codAmount is required when paymentType is COD");
  }

  const res = await http.post<ApiResponse<any>>("/customer/parcels/book", payload);
  return res.data.data as {
    id: string;
    trackingNumber: string;
    pickupAddress: string;
    deliveryAddress: string;
    parcelType: string;
    parcelSize: string;
    weightKg?: number | null;
    paymentType: PaymentType;
    paymentStatus: PaymentStatus;
    codAmount?: number | null;
    status: ParcelStatus;
    expectedPickupAt?: string | null;
    expectedDeliveryAt?: string | null;
    createdAt: string;
  };
}

export type ListCustomerParcelsQuery = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
  trackingNumber?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  status?: ParcelStatus;
  paymentType?: PaymentType;
  paymentStatus?: PaymentStatus;
};

export async function listCustomerParcels(params?: ListCustomerParcelsQuery) {
  const res = await http.get<ApiResponse<CustomerParcelsResponse<CustomerParcelListItem>>>("/customer/parcels", { params });
  return res.data.data;
}

export async function getCustomerParcel(id: string) {
  const res = await http.get<ApiResponse<CustomerParcelDetails>>(`/customer/parcels/${id}`);
  return res.data.data;
}

export async function trackCustomerParcel(id: string) {
  const res = await http.get<ApiResponse<{ points: TrackingPoint[] }>>(`/customer/parcels/${id}/track`);
  return res.data.data;
}
