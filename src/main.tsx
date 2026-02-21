import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { OrdersProvider } from './contexts/OrdersContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/onedelivery-frontend">
      <AuthProvider>
        <OrdersProvider>
          <App />
        </OrdersProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
