import { ClipboardList, LayoutDashboard, Map, Package, Route as RouteIcon, Users } from "lucide-react";

export type NavItem = { to: string; label: string; icon: React.ComponentType<{ size?: number }>; i18nKey?: string };

export const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Overview", i18nKey: "overview", icon: LayoutDashboard },
  { to: "/admin/parcels", label: "Parcels", i18nKey: "parcels", icon: Package },
  { to: "/admin/users", label: "Users", i18nKey: "users", icon: Users },
  { to: "/admin/assignments", label: "Assignments", i18nKey: "assignments", icon: RouteIcon },
];

export const AGENT_NAV: NavItem[] = [
  { to: "/agent", label: "Overview", i18nKey: "overview", icon: LayoutDashboard },
  { to: "/agent/tasks", label: "Tasks & COD", i18nKey: "tasks", icon: ClipboardList },
  { to: "/agent/map", label: "Route Map", i18nKey: "route", icon: Map },
];

export const CUSTOMER_NAV: NavItem[] = [
  { to: "/customer", label: "Dashboard", i18nKey: "dashboard", icon: LayoutDashboard },
  { to: "/customer/book", label: "Book pickup", i18nKey: "book", icon: Package },
  { to: "/customer/history", label: "History", i18nKey: "history", icon: ClipboardList },
  // { to: "/customer/map", label: "Track", i18nKey: "map", icon: Map },
];
