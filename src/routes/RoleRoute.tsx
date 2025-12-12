import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function RoleRoute({ allow }: { allow: Array<"admin" | "agent" | "customer"> }) {
  
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();


  if (!isAuthenticated) 
    return <Navigate to="/login" replace state={{ from: location }} />;


  if (role && allow.includes(role))
     return <Outlet />;


  return <Navigate to="/dashboard" replace />;
}
