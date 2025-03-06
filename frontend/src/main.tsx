import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from "@/components/ui/sonner"


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className=" bg-gray-100">
      <div className="flex flex-col h-full w-4xl mx-auto">
        <App />
        <Toaster richColors/>
      </div>
    </main>
  </StrictMode>,
)
