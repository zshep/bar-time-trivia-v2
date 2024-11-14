import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Headbanner from './components/headbanner.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Headbanner></Headbanner>
    <App />
  </StrictMode>,
)
