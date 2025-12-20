import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors expand={false} toastOptions={{ duration: 4000 }} />
    </AuthProvider>
  </StrictMode>,
)
