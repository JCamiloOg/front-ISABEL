import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import IndexPage from "../features/landing/pages/IndexPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import DashboardLayout from "../features/dashboard/layout/DashboardLayout";
import Navbar from "../features/landing/components/Navbar";
import ClientsPage from "../features/dashboard/pages/ClientsPage";

const rootRoute = createRootRoute({
  component: () =>
    <div className="min-h-screen bg-app-bg text-app-text font-sans selection:bg-brand-sky/35 selection:text-brand-royal transition-colors duration-200">
      <Outlet />
    </div>,
});

const indexLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "indexLayout",
  component: () => <>
    <div className="bg-brand-navy text-xs text-white/90 py-2 px-4 text-center border-b border-brand-royal/20 tracking-wide">
      <span>Envíos gratuitos a todo el país en pedidos superiores a $200.000 • Calidad hecha con dedicación</span>
    </div>
    <Navbar />

    <Outlet />
  </>,
});

const indexRoute = createRoute({
  getParentRoute: () => indexLayout,
  path: "/",
  component: () => <IndexPage />,
});


const dashboardLayout = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => <DashboardLayout />,
});

const dashboardRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/",
  component: () => <DashboardPage />,
});

const clientsRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/clients",
  component: () => <ClientsPage />
});

const routeTree = rootRoute.addChildren([
  indexLayout.addChildren([
    indexRoute
  ]),
  dashboardLayout.addChildren([
    dashboardRoute,
    clientsRoute
  ])
]);

export const router = createRouter({
  routeTree,
});
