import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./rootRoute";
import AuthLayout from "../../features/auth/layout/AuthLayout";
import LoginPage from "../../features/auth/pages/LoginPage";
import RegisterPage from "../../features/auth/pages/RegisterPage";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage";

export const authLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "authLayout",
  component: () => <AuthLayout />,
});

export const loginRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/login",
  component: () => <LoginPage />,
});

export const registerRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/register",
  component: () => <RegisterPage />,
});

export const forgotPasswordRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/forgot-password",
  component: () => <ForgotPasswordPage />,
});

export const authRoutes = authLayout.addChildren([
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
]);

