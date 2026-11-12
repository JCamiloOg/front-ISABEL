import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './index.css'
import App from './App'

// Inicialización controlada de AOS según reglas del sistema
AOS.init({
  duration: 600,
  easing: 'ease-out',
  once: true,
  offset: 80,
  disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
