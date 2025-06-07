'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // Detecta se é mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Fecha o sidebar no mobile quando mudar de rota
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [pathname, isMobile])

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
        isMobile={isMobile}
      />
      <main
        className={cn(
          'transition-all duration-300 ease-in-out',
          isMobile
            ? 'ml-0'
            : isSidebarOpen
            ? 'ml-64' // largura do sidebar expandido
            : 'ml-20' // largura do sidebar retraído
        )}
      >
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  )
}
