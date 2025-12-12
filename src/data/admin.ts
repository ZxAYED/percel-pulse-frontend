export const adminMetrics = [
  { label: "Bookings today", value: "1,240", helper: "+12% vs yesterday" },
  { label: "Failed deliveries", value: "12", helper: "Investigate cold-chain handoff" },
  { label: "COD amount", value: "BDT 415,900", helper: "4 payouts pending" },
  { label: "On-road parcels", value: "86", helper: "18 live routes" },
];

export const adminParcels = [
  { id: "#P-1028", status: "In Transit", eta: "35m", lane: "Gulshan", tone: "bg-blue-100 text-blue-700" },
  { id: "#P-1027", status: "Picked Up", eta: "1h 10m", lane: "Banani", tone: "bg-cyan-100 text-cyan-700" },
  { id: "#P-1026", status: "Delayed", eta: "1h 40m", lane: "Uttara", tone: "bg-amber-100 text-amber-700" },
  { id: "#P-1025", status: "Delivered", eta: "09:12", lane: "Mirpur", tone: "bg-emerald-100 text-emerald-700" },
];

export const adminAssignments = [
  { id: "#P-1024", agent: "Arif", status: "Pickup", lane: "Banani" },
  { id: "#P-1025", agent: "Hasan", status: "Delivery", lane: "Uttara" },
  { id: "#P-1026", agent: "Fatema", status: "Return", lane: "Mirpur" },
];

export const adminUsers = [
  { name: "Arif", role: "Agent", status: "Active", tone: "bg-emerald-100 text-emerald-700" },
  { name: "Sumaiya", role: "Customer", status: "Verified", tone: "bg-blue-100 text-blue-700" },
  { name: "Admin Rahman", role: "Admin", status: "Owner", tone: "bg-slate-200 text-slate-800" },
];

export const adminReports = [
  { label: "Bookings", value: "1,204" },
  { label: "Delivered", value: "1,152" },
  { label: "Failed", value: "12" },
  { label: "COD", value: "BDT 415,900" },
];

export const adminBookings = [
  { title: "Bulk booking import", time: "Today 10:00", badge: "CSV" },
  { title: "COD settlement", time: "Today 11:30", badge: "Finance" },
  { title: "New customer signup", time: "Today 12:05", badge: "User" },
];
