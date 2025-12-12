import { Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import { useAuth } from "../hooks/useAuth";

export default function RoleDashboard() {
  const { role } = useAuth();

  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "agent") return <Navigate to="/agent" replace />;
  if (role === "customer") return <Navigate to="/customer" replace />;
  return <Dashboard />;
}
