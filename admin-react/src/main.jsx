import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Estilos originales de SaveBebi
import '../../css/base.css'
import '../../css/sections.css'
import '../../css/responsive.css'
import '../../css/carrito.css'

// Estilos propios de React
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)