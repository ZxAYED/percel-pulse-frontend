export const agentStats = [
  { label: "Stops today", value: "12", helper: "3 completed" },
  { label: "Parcels left", value: "18", helper: "Next hub: Banani" },
  { label: "On-time", value: "96%", helper: "ETA under 10m" },
  { label: "Cash to collect", value: "BDT 18,450", helper: "5 COD drops" },
];

export const agentNextStop = {
  name: "Lotus Tower, Banani",
  eta: "14:20",
  contact: "+880 1711-223344",
  note: "Fragile | 3 parcels",
};

export const agentTimeline = [
  { title: "Pickup confirmed", time: "12:45 PM", tone: "bg-emerald-100 text-emerald-700" },
  { title: "Route optimized (Google Maps)", time: "12:30 PM", tone: "bg-cyan-100 text-cyan-700" },
  { title: "Break logged", time: "12:10 PM", tone: "bg-amber-100 text-amber-700" },
];

export type AgentTaskStatus = "Picked Up" | "In Transit" | "Delivered" | "Failed";

export type AgentTask = {
  id: string;
  address: string;
  slot: string;
  type: "Delivery" | "Pickup" | "Return";
  status: AgentTaskStatus;
  cash?: string;
};

export const agentTasks: AgentTask[] = [
  { id: "#P-1034", address: "House 13, Road 11, Banani", slot: "14:20", type: "Delivery", status: "In Transit", cash: "BDT 2,450" },
  { id: "#P-1033", address: "SK Tower, Badda", slot: "15:00", type: "Pickup", status: "Picked Up" },
  { id: "#P-1032", address: "Lake View, Gulshan 2", slot: "13:40", type: "Delivery", status: "Delivered", cash: "BDT 4,200" },
  { id: "#P-1031", address: "Road 3, Baridhara", slot: "13:05", type: "Return", status: "Failed" },
];

export const agentSafety = [
  { label: "Helmet on", status: "Verified" },
  { label: "Bike lock", status: "Ready" },
  { label: "Insurance", status: "Active" },
];
