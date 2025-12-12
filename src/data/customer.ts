export type PaymentType = "COD" | "Prepaid";

export type Booking = {
  id: string;
  pickup: string;
  delivery: string;
  size: "Small" | "Medium" | "Large";
  payment: PaymentType;
  status: "Requested" | "Assigned" | "Picked Up" | "In Transit" | "Delivered";
};

export const customerBookings: Booking[] = [
  { id: "#B-2041", pickup: "House 12, Dhanmondi", delivery: "Road 18, Banani", size: "Medium", payment: "COD", status: "In Transit" },
  { id: "#B-2040", pickup: "Uttara Sector 7", delivery: "Gulshan 2 Circle", size: "Large", payment: "Prepaid", status: "Assigned" },
  { id: "#B-2039", pickup: "Mirpur DOHS", delivery: "Bashundhara R/A", size: "Small", payment: "COD", status: "Delivered" },
];
