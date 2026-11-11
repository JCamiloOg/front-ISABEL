import { createRootRoute, Outlet } from "@tanstack/react-router";

export const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-app-bg text-app-text font-sans selection:bg-brand-sky/35 selection:text-brand-royal transition-colors duration-200">
      <Outlet />
    </div>
  ),
});

