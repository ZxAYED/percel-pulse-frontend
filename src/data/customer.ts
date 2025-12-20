export type PaymentType = "COD" | "Prepaid";

export type Booking = {
  id: string;
  pickup: string;
  pickupCoords: [number, number];
  delivery: string;
  deliveryCoords: [number, number];
  size: "Small" | "Medium" | "Large";
  payment: PaymentType;
  status: "Requested" | "Assigned" | "Picked Up" | "In Transit" | "Delivered";
  description?: string;
};

export const customerBookings: Booking[] = [
  { id: "#B-2041", pickup: "House 12, Dhanmondi", pickupCoords: [23.7412, 90.3761], delivery: "Road 18, Banani", deliveryCoords: [23.7935, 90.4046], size: "Medium", payment: "COD", status: "In Transit", description: "Fragile glassware" },
  { id: "#B-2040", pickup: "Uttara Sector 7", pickupCoords: [23.8765, 90.3952], delivery: "Gulshan 2 Circle", deliveryCoords: [23.7925, 90.4078], size: "Large", payment: "Prepaid", status: "Assigned" },
  { id: "#B-2039", pickup: "Mirpur DOHS", pickupCoords: [23.8224, 90.3652], delivery: "Bashundhara R/A", deliveryCoords: [23.8151, 90.4410], size: "Small", payment: "COD", status: "Delivered" },
];
