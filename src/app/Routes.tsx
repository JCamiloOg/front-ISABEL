import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import IndexPage from "../features/landing/pages/IndexPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import DashboardLayout from "../features/dashboard/layout/DashboardLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import AuthLayout from "../features/auth/layout/AuthLayout";
import ProductPage from "../features/landing/pages/ProductPage";
import CatalogPage from "../features/landing/pages/CatalogPage";
import IndexLayout from "../features/landing/layout/IndexLayout";
import ProductsDashboardPage from "../features/dashboard/pages/ProductsPage";

export const rootRoute = createRootRoute({
  component: () =>
    <div className="min-h-screen bg-app-bg text-app-text font-sans selection:bg-brand-sky/35 selection:text-brand-royal transition-colors duration-200">
      <Outlet />
    </div>,
});

const indexLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "indexLayout",
  component: () => <IndexLayout />,
});

export const indexRoute = createRoute({
  getParentRoute: () => indexLayout,
  path: "/",
  component: () => <IndexPage />,
});

export const catalogRoute = createRoute({
  getParentRoute: () => indexLayout,
  path: "/catalog",
  component: () => <CatalogPage />
});

export const productRoute = createRoute({
  getParentRoute: () => indexLayout,
  path: "/products/$SKU",
  component: () => <ProductPage />
})

export const authLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "authLayout",
  component: () => <AuthLayout />
})

export const loginRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/login",
  component: () => <LoginPage />
});

export const registerRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/register",
  component: () => <RegisterPage />
});

export const forgotPasswordRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/forgot-password",
  component: () => <ForgotPasswordPage />
});

export const dashboardLayout = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => <DashboardLayout />,
});

export const dashboardRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/",
  component: () => <DashboardPage />,
});

export const productsDashboardRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/products",
  component: () => <ProductsDashboardPage />,
})

// ── Principal ──
export const billsRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/bills",
  component: () => <></>,
});

export const boxesRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/boxes",
  component: () => <></>,
});

// ── Gestión de compras ──
export const categorySupplierRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/category-supplier",
  component: () => <></>,
});

export const supplierRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/supplier",
  component: () => <></>,
});

export const shoppingRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/shopping",
  component: () => <></>,
});

// ── Gestión de ventas ──
export const clientsRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/clients",
  component: () => <></>,
});

export const ordersRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/orders",
  component: () => <></>,
});

export const salesRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/sales",
  component: () => <></>,
});

export const returnsRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/returns",
  component: () => <></>,
});

// ── Configuración ──
export const usersRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/users",
  component: () => <></>,
});

export const rolesRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/roles",
  component: () => <></>,
});

export const permissionsRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/permissions",
  component: () => <></>,
});

const routeTree = rootRoute.addChildren([
  indexLayout.addChildren([
    indexRoute,
    catalogRoute,
    productRoute
  ]),
  authLayout.addChildren([
    loginRoute,
    registerRoute,
    forgotPasswordRoute,
  ]),
  dashboardLayout.addChildren([
    dashboardRoute,
    productsDashboardRoute,
    billsRoute,
    boxesRoute,
    categorySupplierRoute,
    supplierRoute,
    shoppingRoute,
    clientsRoute,
    ordersRoute,
    salesRoute,
    returnsRoute,
    usersRoute,
    rolesRoute,
    permissionsRoute,
  ])
]);

export const router = createRouter({
  routeTree,
});
