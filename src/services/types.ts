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

export type ParcelStatus = "BOOKED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "FAILED";

export type PaymentType = "COD" | "PREPAID";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type CustomerParcel = {
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
  deliveredAt?: string | null;
  failedAt?: string | null;
  createdAt: string;
};

export type CustomerParcelAgentAssignment = {
  agent: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  assignedAt: string;
};

export type CustomerParcelListItem = CustomerParcel & {
  agentAssignment?: CustomerParcelAgentAssignment | null;
};

export type CustomerParcelStatusHistoryItem = {
  status: ParcelStatus;
  remarks: string | null;
  createdAt: string;
  updatedBy: {
    id: string;
    name: string;
    role: ApiRole;
  };
};

export type CustomerParcelDetails = CustomerParcelListItem & {
  customerId: string;
  statusHistory: CustomerParcelStatusHistoryItem[];
};

export type CustomerParcelsMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CustomerParcelsResponse<T> = {
  data: T[];
  meta: CustomerParcelsMeta;
};

export type TrackingPoint = {
  latitude: number;
  longitude: number;
  speedKph: number;
  heading: number;
  recordedAt: string;
};

export type AdminDashboardTotals = {
  users?: number;
  admins?: number;
  customers?: number;
  parcels?: number;
  delivered?: number;
  failed?: number;
  codTotal?: number;
  bookings?: number;
  bookingsToday?: number;
  failedDeliveries?: number;
  cod?: number;
  codAmount?: number;
  onRoad?: number;
  onRoadParcels?: number;
  [key: string]: number | string | null | undefined;
};

export type AdminDashboardMetrics = {
  totals: AdminDashboardTotals;
  bookingsByDay: Record<string, number> | unknown[];
  failedByDay: Record<string, number> | unknown[];
  codByDay: Record<string, number> | unknown[];
};

export type AdminParcelsMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  [key: string]: unknown;
};

export type AdminParcelsResponse<T> = {
  data: T[];
  meta: AdminParcelsMeta;
};

export type AdminParcelCustomer = {
  id: string;
  name: string;
  email?: string;
  phone?: string | null;
};

export type AdminParcel = {
  id: string;
  trackingNumber: string;
  status: ParcelStatus;
  referenceCode?: string | null;
  pickupAddress?: string | null;
  deliveryAddress?: string | null;
  paymentType?: PaymentType;
  paymentStatus?: PaymentStatus;
  codAmount?: number | null;
  deliveredAt?: string | null;
  failedAt?: string | null;
  updatedAt?: string;
  customer?: AdminParcelCustomer;
};

export type AgentAssignment = {
  id?: string;
  parcelId: string;
  agentId: string;
  assignedAt?: string;
  agent?: {
    id: string;
    name: string;
    email?: string;
    phone?: string | null;
  };
};

export type AdminUser = User & {
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  lastLoginAt?: string | null;
};

export type AdminUsersResponse<T> = {
  data: T[];
  meta: AdminParcelsMeta;
};

export type AdminAssignment = {
  id: string;
  parcelId: string;
  agentId: string;
  assignedById?: string;
  assignedAt: string;
  acceptedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  agent?: {
    id: string;
    name: string;
    email?: string;
    phone?: string | null;
  };
  parcel?: {
    id: string;
    trackingNumber?: string;
    referenceCode?: string | null;
    status?: ParcelStatus;
    createdAt?: string;
    pickupAddress?: string | null;
    deliveryAddress?: string | null;
  };
};

export type AdminAssignmentsSummaryByAgent = {
  agentId: string;
  parcels: number;
};

export type AdminAssignmentsResponse = {
  data: AdminAssignment[];
  meta: AdminParcelsMeta;
  summaryByAgent?: AdminAssignmentsSummaryByAgent[];
};

export type CustomerDashboardCards = {
  totalParcels: number;
  activeParcels: number;
  bookedParcels: number;
  pickedUpParcels: number;
  inTransitParcels: number;
  deliveredParcels: number;
  failedParcels: number;
  codPendingAmount: number;
  prepaidPaidCount: number;
  upcomingPickups: number;
  upcomingDeliveries: number;
};

export type CustomerDashboardRecentParcel = {
  id: string;
  trackingNumber: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: ParcelStatus;
  paymentType: PaymentType;
  paymentStatus: PaymentStatus;
  codAmount?: number | null;
  createdAt: string;
};

export type CustomerDashboardMetrics = {
  cards: CustomerDashboardCards;
  bookingsByDay: Record<string, number>;
  recentParcels: CustomerDashboardRecentParcel[];
};

export type AgentDashboardCards = {
  totalAssigned: number;
  activeAssigned: number;
  bookedParcels: number;
  pickedUpParcels: number;
  inTransitParcels: number;
  deliveredParcels: number;
  failedParcels: number;
  assignedToday: number;
  deliveredToday: number;
  codOutstandingAmount: number;
  upcomingPickups: number;
  upcomingDeliveries: number;
};

export type AgentDashboardRecentParcel = {
  id: string;
  trackingNumber: string;
  status: ParcelStatus;
  pickupAddress: string;
  deliveryAddress: string;
  expectedPickupAt?: string | null;
  expectedDeliveryAt?: string | null;
  updatedAt: string;
  customer?: { id: string; name: string; phone?: string | null };
  agentAssignment?: { assignedAt: string; acceptedAt?: string | null; startedAt?: string | null };
};

export type AgentDashboardMetrics = {
  cards: AgentDashboardCards;
  deliveredByDay: Record<string, number>;
  recentParcels: AgentDashboardRecentParcel[];
};
