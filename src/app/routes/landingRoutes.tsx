import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./rootRoute";
import IndexLayout from "../../features/landing/layout/IndexLayout";
import IndexPage from "../../features/landing/pages/IndexPage";
import CatalogPage from "../../features/landing/pages/CatalogPage";
import ProductPage from "../../features/landing/pages/ProductPage";

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

export const landingRoutes = indexLayout.addChildren([
  indexRoute,
  catalogRoute,
  productRoute,
]);

