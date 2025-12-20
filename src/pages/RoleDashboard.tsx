import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function RoleDashboard() {
  const { role } = useAuth();

  if (role === "ADMIN") return <Navigate to="/admin" replace />;
  if (role === "AGENT") return <Navigate to="/agent" replace />;
  if (role === "CUSTOMER") return <Navigate to="/customer" replace />;
  return <Navigate to="/login" replace />;
}
