import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./rootRoute";
import IndexLayout from "../../features/landing/layout/IndexLayout";
import IndexPage from "../../features/landing/pages/IndexPage";
import CatalogPage from "../../features/landing/pages/CatalogPage";
import ProductPage from "../../features/landing/pages/ProductPage";
import CreateOrder from "../../features/landing/pages/CreateOrder";
import OrdersPageByUser from "../../features/landing/pages/OrdersPageByUser";
import MyProfile from "../../features/landing/pages/MyProfile";
import PrivacyPolicy from "../../features/landing/pages/PrivacyPolicy";
import WarrantyPolicy from "../../features/landing/pages/WarrantyPolicy";

export const indexLayout = createRoute({
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
  component: () => <CatalogPage />,
});

export const productRoute = createRoute({
  getParentRoute: () => indexLayout,
  path: "/products/$SKU",
  component: () => <ProductPage />,
});

export const createOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: () => <CreateOrder />,
});

export const getOrdersRoute = createRoute({
  getParentRoute: () => indexLayout,
  path: "/orders",
  component: () => <OrdersPageByUser />
});

export const myProfileRoute = createRoute({
  getParentRoute: () => indexLayout,
  path: "/profile",
  component: () => <MyProfile />,
});

export const privacyPolicyRoute = createRoute({
  getParentRoute: () => indexLayout,
  path: "/privacy-policy",
  component: () => <PrivacyPolicy />,
});

export const warrantyPolicy = createRoute({
  getParentRoute: () => indexLayout,
  path: "/warrant-policy",
  component: () => <WarrantyPolicy />
});

export const landingRoutes = indexLayout.addChildren([
  indexRoute,
  catalogRoute,
  productRoute,
  myProfileRoute,
  privacyPolicyRoute,
  warrantyPolicy,
  getOrdersRoute
]);

