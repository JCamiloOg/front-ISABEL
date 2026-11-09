import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import IndexPage from "../features/landing/pages/IndexPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import DashboardLayout from "../features/dashboard/layout/DashboardLayout";
import Navbar from "../features/landing/components/Navbar";
import ClientsPage from "../features/dashboard/pages/ClientsPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import AuthLayout from "../features/auth/layout/AuthLayout";

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
      <span>Tu proveedor de calzado favorito y de confianza</span>
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

const authLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "authLayout",
  component: () => <AuthLayout />
})

const loginRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/login",
  component: () => <LoginPage />
});

const registerRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/register",
  component: () => <RegisterPage />
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/forgot-password",
  component: () => <ForgotPasswordPage />
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
  authLayout.addChildren([
    loginRoute,
    registerRoute,
    forgotPasswordRoute,
  ]),
  dashboardLayout.addChildren([
    dashboardRoute,
    clientsRoute
  ])
]);

export const router = createRouter({
  routeTree,
});
