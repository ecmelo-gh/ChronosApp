'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { lightTheme, darkTheme } from '@/styles/colors'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  effectiveTheme: 'light' | 'dark'
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [theme, setTheme] = useState<Theme>('system')
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light')

  // Load theme from user preferences or localStorage
  useEffect(() => {
    const loadTheme = async () => {
      if (session?.user?.email) {
        // If user is logged in, try to get their preference from the API
        try {
          const response = await fetch('/api/user/theme-preference')
          const data = await response.json()
          setTheme(data.theme_preference)
          return
        } catch (error) {
          console.error('Failed to load theme preference:', error)
        }
      }
      
      // Fallback to localStorage if no user or API fails
      const saved = localStorage.getItem('theme') as Theme
      if (saved) setTheme(saved)
    }
    
    loadTheme()
  }, [session])

  // Update effective theme based on system preference when theme is 'system'
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const updateEffectiveTheme = () => {
      if (theme === 'system') {
        setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light')
      } else {
        setEffectiveTheme(theme as 'light' | 'dark')
      }
    }

    updateEffectiveTheme()
    mediaQuery.addEventListener('change', updateEffectiveTheme)

    return () => mediaQuery.removeEventListener('change', updateEffectiveTheme)
  }, [theme])

  // Update document theme class and save preference
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(effectiveTheme)
    localStorage.setItem('theme', theme)

    // If user is logged in, save preference to API
    if (session?.user?.email) {
      fetch('/api/user/theme-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      }).catch(error => console.error('Failed to save theme preference:', error))
    }
  }, [theme, effectiveTheme, session])

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'system') return 'light'
      if (prev === 'light') return 'dark'
      return 'system'
    })
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      isDark: effectiveTheme === 'dark',
      effectiveTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Hook to get current theme colors
export function useThemeColors() {
  const { isDark } = useTheme()
  return isDark ? darkTheme.colors : lightTheme.colors
}
