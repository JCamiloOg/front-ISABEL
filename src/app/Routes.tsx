import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import IndexPage from "../features/landing/pages/IndexPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import DashboardLayout from "../features/dashboard/layout/DashboardLayout";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "indexLayout",
  component: () => <Outlet />,
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

const routeTree = rootRoute.addChildren([
  indexLayout.addChildren([
    indexRoute
  ]),
  dashboardLayout.addChildren([
    dashboardRoute
  ])
]);

export const router = createRouter({
  routeTree,
});
