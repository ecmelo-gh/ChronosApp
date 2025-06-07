'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { styled } from '@stitches/react'

const ToggleButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.5rem',
  height: '2.5rem',
  padding: '0.5rem',
  borderRadius: '0.5rem',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  color: 'inherit',

  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    '.dark &': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },

  svg: {
    width: '1.25rem',
    height: '1.25rem',
  },
})

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <ToggleButton onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : theme === 'light' ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
    </ToggleButton>
  )
}
