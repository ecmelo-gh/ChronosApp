import { styled } from '@stitches/react'
import { theme } from '@/styles/theme'
import { respondTo } from '@/styles/utils'

export const Flex = styled('div', {
  display: 'flex',

  variants: {
    direction: {
      row: { flexDirection: 'row' },
      column: { flexDirection: 'column' },
      rowReverse: { flexDirection: 'row-reverse' },
      columnReverse: { flexDirection: 'column-reverse' },
    },
    align: {
      start: { alignItems: 'flex-start' },
      center: { alignItems: 'center' },
      end: { alignItems: 'flex-end' },
      stretch: { alignItems: 'stretch' },
      baseline: { alignItems: 'baseline' },
    },
    justify: {
      start: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      end: { justifyContent: 'flex-end' },
      between: { justifyContent: 'space-between' },
      around: { justifyContent: 'space-around' },
    },
    wrap: {
      noWrap: { flexWrap: 'nowrap' },
      wrap: { flexWrap: 'wrap' },
      wrapReverse: { flexWrap: 'wrap-reverse' },
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
    responsive: {
      true: {
        flexDirection: 'column',
        [respondTo.md]: {
          flexDirection: 'row',
        },
      },
    },
  },

  defaultVariants: {
    direction: 'row',
    align: 'stretch',
    justify: 'start',
    wrap: 'noWrap',
    gap: 4,
  },
})
