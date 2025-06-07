import { styled } from '@stitches/react'
import { theme } from '@/styles/theme'
import { respondTo } from '@/styles/utils'

export const Grid = styled('div', {
  display: 'grid',
  gap: theme.spacing[4],

  variants: {
    cols: {
      1: { gridTemplateColumns: 'repeat(1, 1fr)' },
      2: { 
        gridTemplateColumns: 'repeat(1, 1fr)',
        [respondTo.sm]: {
          gridTemplateColumns: 'repeat(2, 1fr)',
        },
      },
      3: {
        gridTemplateColumns: 'repeat(1, 1fr)',
        [respondTo.sm]: {
          gridTemplateColumns: 'repeat(2, 1fr)',
        },
        [respondTo.lg]: {
          gridTemplateColumns: 'repeat(3, 1fr)',
        },
      },
      4: {
        gridTemplateColumns: 'repeat(1, 1fr)',
        [respondTo.sm]: {
          gridTemplateColumns: 'repeat(2, 1fr)',
        },
        [respondTo.lg]: {
          gridTemplateColumns: 'repeat(4, 1fr)',
        },
      },
      auto: {
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      },
    },
    gap: {
      1: { gap: theme.spacing[1] },
      2: { gap: theme.spacing[2] },
      3: { gap: theme.spacing[3] },
      4: { gap: theme.spacing[4] },
      5: { gap: theme.spacing[5] },
      6: { gap: theme.spacing[6] },
      8: { gap: theme.spacing[8] },
    },
  },

  defaultVariants: {
    cols: 1,
    gap: 4,
  },
})
