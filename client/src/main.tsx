import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AppRouter } from './router/AppRouter.tsx'
import { useAuthStore } from './state/authStore.ts'

// Hydrate the cookie-based session on boot (HttpOnly cookie sent automatically).
void useAuthStore.getState().hydrate()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </StrictMode>,
)
