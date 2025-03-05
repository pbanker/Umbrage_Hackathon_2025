import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className="h-screen w-screen bg-gray-100">
      <div className="flex flex-col h-full w-6xl mx-auto">
        <App />
      </div>
    </main>
  </StrictMode>,
)
