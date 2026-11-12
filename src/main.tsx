import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style/index.css'
import App from './App'
import ThemeProvider from './shared/provider/ThemeProvider'
import UserProvider from './shared/provider/UserProvider'
import CartProvider from './shared/provider/CartProvider'

// Inicialización controlada de AOS según reglas del sistema

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <ThemeProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </ThemeProvider>
    </UserProvider>
  </StrictMode>
)
