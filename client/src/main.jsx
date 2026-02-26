import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Debug logging for production
console.log('ReKal App Starting...', {
  env: import.meta.env.MODE,
  base: import.meta.env.BASE_URL,
  time: new Date().toISOString()
})

const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Root element not found!')
} else {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>,
    )
    console.log('ReKal App Rendered Successfully')
  } catch (error) {
    console.error('Failed to render app:', error)
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; text-align: center;">
        <h1 style="color: #dc2626;">Terjadi Kesalahan</h1>
        <p>Aplikasi gagal dimuat. Silakan refresh halaman atau hubungi administrator.</p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Error: ${error.message}
        </p>
      </div>
    `
  }
}
