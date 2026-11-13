import { createRouter } from "@tanstack/react-router";
import { rootRoute } from "./rootRoute";
import { createOrderRoute, landingRoutes } from "./landingRoutes";
import { authRoutes } from "./authRoutes";
import { dashboardRoutes } from "./dashboardRoutes";

export * from "./rootRoute";
export * from "./landingRoutes";
export * from "./authRoutes";
export * from "./dashboardRoutes";

export const routeTree = rootRoute.addChildren([
  landingRoutes,
  authRoutes,
  dashboardRoutes,
  createOrderRoute
]);

export const router = createRouter({
  routeTree,
});

