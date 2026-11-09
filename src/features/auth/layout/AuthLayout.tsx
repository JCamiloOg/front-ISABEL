import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useTheme from "../../../shared/hooks/useTheme";
import { Outlet } from "@tanstack/react-router";

export default function AuthLayout() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen w-full flex bg-app-bg text-app-text font-sans transition-colors duration-200">
            <button
                type="button"
                onClick={toggleTheme}
                className="fixed top-5 right-5 z-50 p-2.5 rounded-full bg-app-surface border border-app-border text-brand-royal dark:text-brand-sky hover:bg-brand-sky/15 shadow-sm transition-all cursor-pointer"
                title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                aria-label="Alternar tema"
            >
                <FontAwesomeIcon icon={theme === "dark" ? faSun : faMoon} className="text-base" />
            </button>

            <Outlet />

        </div>
    );
}