import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { GlobalErrorBoundary } from './components/ErrorBoundary'
import { OfflineBanner } from './components/OfflineBanner'
import './index.css'
// @ts-ignore
import '@fontsource/noto-sans-bengali'
import App from './App.tsx'

const queryClient = new QueryClient()

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            <ThemeProvider>
              <BrowserRouter>
                <OfflineBanner />
                <App />
              </BrowserRouter>
            </ThemeProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
)
