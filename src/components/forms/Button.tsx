import { styled } from '@stitches/react'

export const Button = styled('button', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '0.5rem 1rem',
  borderRadius: 'var(--radius)',
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: '1.25rem',
  transition: 'all 0.2s',
  cursor: 'pointer',
  border: '1px solid transparent',

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  variants: {
    variant: {
      primary: {
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
        '&:hover': {
          backgroundColor: 'var(--primary-hover)',
        },
        '&:focus': {
          outline: 'none',
          boxShadow: '0 0 0 2px var(--primary-alpha)',
        },
      },
      secondary: {
        backgroundColor: 'var(--secondary)',
        color: 'var(--secondary-foreground)',
        '&:hover': {
          backgroundColor: 'var(--secondary-hover)',
        },
        '&:focus': {
          outline: 'none',
          boxShadow: '0 0 0 2px var(--secondary-alpha)',
        },
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: 'var(--border)',
        color: 'var(--foreground)',
        '&:hover': {
          backgroundColor: 'var(--accent)',
          color: 'var(--accent-foreground)',
        },
        '&:focus': {
          outline: 'none',
          boxShadow: '0 0 0 2px var(--accent-alpha)',
        },
      },
      destructive: {
        backgroundColor: 'var(--destructive)',
        color: 'var(--destructive-foreground)',
        '&:hover': {
          backgroundColor: 'var(--destructive-hover)',
        },
        '&:focus': {
          outline: 'none',
          boxShadow: '0 0 0 2px var(--destructive-alpha)',
        },
      },
    },
    size: {
      sm: {
        height: '2rem',
        padding: '0 0.75rem',
        fontSize: '0.75rem',
      },
      md: {
        height: '2.5rem',
        padding: '0 1rem',
        fontSize: '0.875rem',
      },
      lg: {
        height: '3rem',
        padding: '0 1.5rem',
        fontSize: '1rem',
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
    loading: {
      true: {
        position: 'relative',
        pointerEvents: 'none',
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '1rem',
          height: '1rem',
          border: '2px solid transparent',
          borderTopColor: 'currentColor',
          borderRightColor: 'currentColor',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        },
        '& > *': {
          opacity: 0,
        },
      },
    },
  },

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})
