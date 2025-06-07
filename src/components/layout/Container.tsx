import { styled } from '@stitches/react'
import { theme } from '@/styles/theme'
import { respondTo } from '@/styles/utils'

export const Container = styled('div', {
  width: '100%',
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingLeft: theme.spacing[4],
  paddingRight: theme.spacing[4],
  maxWidth: '100%',

  variants: {
    size: {
      sm: {
        [respondTo.sm]: {
          maxWidth: theme.breakpoints.sm,
        },
      },
      md: {
        [respondTo.md]: {
          maxWidth: theme.breakpoints.md,
        },
      },
      lg: {
        [respondTo.lg]: {
          maxWidth: theme.breakpoints.lg,
        },
      },
      xl: {
        [respondTo.xl]: {
          maxWidth: theme.breakpoints.xl,
        },
      },
      '2xl': {
        [respondTo['2xl']]: {
          maxWidth: theme.breakpoints['2xl'],
        },
      },
      fluid: {
        maxWidth: '100%',
      },
    },
  },

  defaultVariants: {
    size: 'lg',
  },
})
