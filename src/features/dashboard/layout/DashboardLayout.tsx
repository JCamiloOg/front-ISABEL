import { Outlet } from "@tanstack/react-router";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar: sticky en desktop, offcanvas en móvil (controlado internamente) */}
            <Sidebar />
            <main className="flex-1 min-w-0 min-h-screen overflow-x-hidden p-6 sm:p-8 lg:p-10">
                <Outlet />
            </main>
        </div>
    );
}
