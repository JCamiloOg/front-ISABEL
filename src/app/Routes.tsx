import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import IndexPage from "../features/landing/pages/IndexPage";

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

const routeTree = rootRoute.addChildren([
  indexLayout.addChildren([indexRoute]),
]);

export const router = createRouter({
  routeTree,
});
