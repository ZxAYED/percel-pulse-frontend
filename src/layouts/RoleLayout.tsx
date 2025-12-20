
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function RoleLayout() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="flex w-full px-4 pb-10 pt-6 lg:px-10 lg:pl-[22rem]">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <main className="flex-1">
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-white p-4 sm:p-5 lg:p-6 shadow-[0_18px_60px_-44px_rgba(15,23,42,0.35)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
