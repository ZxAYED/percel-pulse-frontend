import { createBrowserRouter } from "react-router-dom";
import RoleLayout from "../layouts/RoleLayout";
import Assignments from "../pages/admin/Assignments";
import Overview from "../pages/admin/Overview";
import Parcels from "../pages/admin/Parcels";
import Users from "../pages/admin/Users";
import AgentOverview from "../pages/agent/Overview";
import AgentTasks from "../pages/agent/Tasks";
import CustomerBook from "../pages/customer/Book";
import CustomerDashboard from "../pages/customer/Dashboard";
import CustomerHistory from "../pages/customer/History";
import CustomerParcelDetails from "../pages/customer/ParcelDetails";
import Login from "../pages/Login";
import Register from "../pages/Register";
import RoleDashboard from "../pages/RoleDashboard";
import TrackMap from "../pages/TrackMap";
import RoleRoute from "./RoleRoute";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/",
    element: <RoleRoute allow={["ADMIN", "AGENT", "CUSTOMER"]} />,        
    children: [
      {
        index: true,
        element: <RoleDashboard />,
      },
      {
        element: <RoleRoute allow={["CUSTOMER"]} />,    
        children: [
          { 
            path: "/customer",
            element: <RoleLayout />,
            children: [
              { index: true, element: <CustomerDashboard /> },
              { path: "book", element: <CustomerBook /> },
              { path: "history", element: <CustomerHistory /> },
              { path: "parcels", element: <CustomerParcelDetails /> },
              { path: "parcels/:parcelId", element: <CustomerParcelDetails /> },
              { path: "map", element: <TrackMap /> },
            ],
          },
        ],
      },
      {
        element: <RoleRoute allow={["ADMIN"]} />,    
        children: [
          {
            path: "/admin",
            element: <RoleLayout />,
            children: [
              { index: true, element: <Overview /> },
              { path: "parcels", element: <Parcels /> },
              { path: "users", element: <Users /> },
              { path: "assignments", element: <Assignments /> },
            ],
          },
        ],
      },
      {
        element: <RoleRoute allow={["AGENT"]} />,    
        children: [
          {
            path: "/agent",
            element: <RoleLayout />,
            children: [
              { index: true, element: <AgentOverview /> },
              { path: "tasks", element: <AgentTasks /> },
              { path: "map", element: <TrackMap /> },
            ],
          },
        ],
      },
    ],
  },
  
]);
