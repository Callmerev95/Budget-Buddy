import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // Jika belum ada, buat file kosong saja dulu

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)