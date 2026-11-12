import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./rootRoute";
import DashboardLayout from "../../features/dashboard/layout/DashboardLayout";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import ProductsDashboardPage from "../../features/dashboard/pages/ProductsPage";
import OrdersPage from "../../features/dashboard/pages/OrdersPage";

export const dashboardLayout = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => <DashboardLayout />,
});

// ── Principal ──
export const dashboardRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/",
  component: () => <DashboardPage />,
});

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

// ── Gestión de compras / Productos ──
export const productsDashboardRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/products",
  component: () => <ProductsDashboardPage />,
});

export const productColorsRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/products/colors",
  component: () => <></>,
});

export const productSizesRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/products/sizes",
  component: () => <></>,
});

export const productCategoriesRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/products/categories",
  component: () => <></>,
});

export const productBrandsRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/products/brands",
  component: () => <></>,
});

export const productTypesRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/products/types",
  component: () => <></>,
});

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
  component: () => <OrdersPage />,
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

export const dashboardRoutes = dashboardLayout.addChildren([
  dashboardRoute,
  productsDashboardRoute,
  productColorsRoute,
  productSizesRoute,
  productCategoriesRoute,
  productBrandsRoute,
  productTypesRoute,
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
]);

