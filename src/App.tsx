import { RouterProvider } from "@tanstack/react-router";
import { router } from "./app/Routes";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect } from "react";
import AOS from 'aos';
import 'aos/dist/aos.css';
function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000, // Duración de las animaciones en milisegundos
      once: true,     // Si la animación solo debe ejecutarse una vez
      easing: 'ease-in-out',
    });
  }, [])
  return (
    <>
      <RouterProvider router={router} />
      <TanStackRouterDevtools router={router} />
    </>
  )
}

export default App
