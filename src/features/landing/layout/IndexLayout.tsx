import { Outlet } from "@tanstack/react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function IndexLayout() {
    return (
        <>
            <div className="bg-brand-navy text-xs text-white/90 py-2 px-4 text-center border-b border-brand-royal/20 tracking-wide">
                <span>Tu proveedor de calzado favorito y de confianza</span>
            </div>
            <Navbar />

            <Outlet />

            <Footer />
        </>);
}