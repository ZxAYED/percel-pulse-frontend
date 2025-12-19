import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../context/AuthContextBase";

export default function RoleRoute({ allow }: { allow: Array<Role> }) {
  
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();


  if (!isAuthenticated) 
    return <Navigate to="/login" replace state={{ from: location }} />;


  if (role && allow.includes(role))
     return <Outlet />;


  if (role === "ADMIN") return <Navigate to="/admin" replace />;
  if (role === "AGENT") return <Navigate to="/agent" replace />;
  if (role === "CUSTOMER") return <Navigate to="/customer" replace />;
  return <Navigate to="/login" replace />;
}
