import { createBrowserRouter, Navigate } from "react-router-dom";
import RoleLayout from "../layouts/RoleLayout";
import Assignments from "../pages/admin/Assignments";
import Overview from "../pages/admin/Overview";
import Parcels from "../pages/admin/Parcels";
import Reports from "../pages/admin/Reports";
import Users from "../pages/admin/Users";
import AgentOverview from "../pages/agent/Overview";
import AgentTasks from "../pages/agent/Tasks";
import CustomerBook from "../pages/customer/Book";
import CustomerDashboard from "../pages/customer/Dashboard";
import CustomerHistory from "../pages/customer/History";
import Login from "../pages/Login";
import Register from "../pages/Register";
import RoleDashboard from "../pages/RoleDashboard";
import TrackMap from "../pages/TrackMap";

export const router = createBrowserRouter([
  { path: "/login", element: <Login />  },
  { path: "/register", element: <Register /> },
  {
    // element: <PrivateRoute />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      {
        element: <RoleLayout />,
        children: [
          { path: "/dashboard", element: <RoleDashboard /> },
          { path: "/map", element: <TrackMap /> },
        ],
      },
      {
        path: "/customer",
        element: <RoleLayout />,
        children: [
          { index: true, element: <CustomerDashboard /> },
          { path: "book", element: <CustomerBook /> },
          { path: "history", element: <CustomerHistory /> },
        ],
      },
      {
        // element: <RoleRoute allow={["admin"]} />,
        children: [
          {
            path: "/admin",
            element: <RoleLayout />,
            children: [
              { index: true, element: <Overview /> },
              { path: "parcels", element: <Parcels /> },
              { path: "users", element: <Users /> },
              { path: "assignments", element: <Assignments /> },
              { path: "reports", element: <Reports /> },
            ],
          },
        ],
      },
      {
        // element: <RoleRoute allow={["agent"]} />,
        children: [
          {
            path: "/agent",
            element: <RoleLayout />,
            children: [
              { index: true, element: <AgentOverview /> },
              { path: "tasks", element: <AgentTasks /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
