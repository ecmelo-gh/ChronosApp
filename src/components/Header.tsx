'use client'

import { signOut, useSession } from 'next-auth/react'
import { Menu, LogOut, User } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  onMenuClick: () => void
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4">
      <button
        type="button"
        className="text-gray-500 hover:text-gray-600 lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex-1" />

      <div className="relative">
        <button
          type="button"
          className="flex items-center space-x-3 text-sm focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <span className="hidden md:inline-block font-medium text-gray-700">
            {session?.user?.name}
          </span>
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
            <button
              onClick={() => signOut()}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}