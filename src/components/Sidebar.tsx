'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  MessageSquare,
  DollarSign,
  Scissors,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/customers', icon: Users },
  { name: 'Agendamentos', href: '/appointments', icon: Calendar },
  { name: 'Serviços', href: '/services', icon: Scissors },
  { name: 'Mensagens', href: '/messages', icon: MessageSquare },
  { name: 'Financeiro', href: '/finance', icon: DollarSign },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

interface SidebarProps {
  isMobile: boolean
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isMobile, isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()

  // Fecha o sidebar no mobile quando mudar de rota
  useEffect(() => {
    if (isMobile && isOpen) {
      onToggle()
    }
  }, [pathname, isMobile, isOpen, onToggle])

  return (
    <>
      {/* Overlay para mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col bg-white transition-all duration-300 ease-in-out',
          // No mobile: esconde completamente quando fechado
          // No desktop: sempre visível, apenas muda a largura
          isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0',
          // Largura: 64 (16rem) quando aberto, 20 (5rem) quando fechado
          isMobile ? 'w-64' : isOpen ? 'w-64' : 'w-20',
          'border-r border-gray-200'
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          <h1 
            className={cn(
              "font-bold transition-all duration-300",
              (!isOpen && !isMobile) ? "opacity-0 w-0" : "opacity-100 w-auto"
            )}
          >
            Sistema de Gestão
          </h1>
          {!isMobile && (
            <button
              onClick={onToggle}
              className="p-1 rounded-lg hover:bg-gray-100"
              title={isOpen ? "Retrair menu" : "Expandir menu"}
            >
              {isOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  // Centraliza o ícone quando retraído no desktop
                  (!isOpen && !isMobile) && 'justify-center'
                )}
                title={(!isOpen && !isMobile) ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    'flex-shrink-0 h-5 w-5',
                    isActive
                      ? 'text-gray-500'
                      : 'text-gray-400 group-hover:text-gray-500',
                    (!isOpen && !isMobile) ? 'mx-0' : 'mr-3'
                  )}
                  aria-hidden="true"
                />
                <span 
                  className={cn(
                    "transition-all duration-300",
                    (!isOpen && !isMobile) ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}
                >
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}