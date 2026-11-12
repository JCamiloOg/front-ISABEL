import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style/index.css'
import App from './App'
import ThemeProvider from './shared/provider/ThemeProvider'
import UserProvider from './shared/provider/UserProvider'

// Inicialización controlada de AOS según reglas del sistema

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </UserProvider>
  </StrictMode>
)
