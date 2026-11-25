import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./rootRoute";
import DashboardLayout from "../../features/dashboard/layout/DashboardLayout";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import ProductsDashboardPage from "../../features/dashboard/pages/products/ProductsPage";
import OrdersPage from "../../features/dashboard/pages/orders/OrdersPage";
import BillsPage from "../../features/dashboard/pages/bills/BillsPage";
import ProveedoresPage from "../../features/dashboard/pages/suppliers/ProveedoresPage";
import VentasPage from "../../features/dashboard/pages/Ventas/VentasPage";
import ClientesPage from "../../features/dashboard/pages/clients/ClientsPage";
import ReturnsPage from "../../features/dashboard/pages/Returns/ReturnsPage";
import SaleReturnDetailPage from "../../features/dashboard/pages/Returns/SaleReturnDetailPage";
import BoxesPage from "../../features/dashboard/pages/Boxes/BoxesPage";
import UsersPage from "../../features/dashboard/pages/users/UsersPage";
import ColoresProducts from "../../features/dashboard/pages/products/ColoresProducts";
import TallaProducts from "../../features/dashboard/pages/products/TallaProducts";
import CategoriaProduct from "../../features/dashboard/pages/products/CategoriaProduct";
import MarcaProducts from "../../features/dashboard/pages/products/MarcaProducts";
import TipoProducts from "../../features/dashboard/pages/products/TipoProducts";
import CategoriaProveedor from "../../features/dashboard/pages/suppliers/suppliersCategory";
import Purchases from "../../features/dashboard/pages/Purchases/Purchases";
import RolesPage from "../../features/dashboard/pages/Roles/RolesPage";
import PermissionsPage from "../../features/dashboard/pages/Permissions/PermissionsPage";

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

  component: () => <BillsPage />,
});

export const boxesRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/boxes",
  component: () => <BoxesPage />,
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
  component: () => <ColoresProducts />,
});

export const productSizesRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/products/sizes",
  component: () => <TallaProducts />,
});

export const productCategoriesRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/products/categories",
  component: () => <CategoriaProduct />,
});

export const productBrandsRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/products/brands",
  component: () => <MarcaProducts />,
});

export const productTypesRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/products/types",
  component: () => <TipoProducts />,
});

export const categorySupplierRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/category-supplier",
  component: () => <CategoriaProveedor />,
});

export const supplierRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/supplier",
  component: () => <ProveedoresPage />,
});

export const purchaseRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/purchase",
  component: () => <Purchases />,
});

// ── Gestión de ventas ──
export const clientsRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/clients",
  component: () => <ClientesPage />,
});

export const ordersRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/orders",
  component: () => <OrdersPage />,
});

export const salesRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/sales",
  component: () => <VentasPage />,
});

export const returnsRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/returns",
  component: () => <ReturnsPage />,
});

export const returnDetailRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/returns/$idSale",
  component: () => <SaleReturnDetailPage />,
});

// ── Configuración ──
export const usersRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/users",
  component: () => <UsersPage />,
});

export const rolesRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/roles",
  component: () => <RolesPage />,
});

export const permissionsRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/permissions",
  component: () => <PermissionsPage />,
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
  purchaseRoute,
  clientsRoute,
  ordersRoute,
  salesRoute,
  returnsRoute,
  returnDetailRoute,
  usersRoute,
  rolesRoute,
  permissionsRoute,
]);

