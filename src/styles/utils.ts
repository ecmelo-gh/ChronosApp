import { theme } from './theme'

export const createMediaQuery = (minWidth: keyof typeof theme.breakpoints) => {
  return `@media (min-width: ${theme.breakpoints[minWidth]})`
}

export const respondTo = {
  xs: createMediaQuery('xs'),
  sm: createMediaQuery('sm'),
  md: createMediaQuery('md'),
  lg: createMediaQuery('lg'),
  xl: createMediaQuery('xl'),
  '2xl': createMediaQuery('2xl'),
}

export const pxToRem = (px: number) => `${px / 16}rem`

export const clamp = (min: number, preferred: number, max: number) => {
  return `clamp(${pxToRem(min)}, ${preferred}vw, ${pxToRem(max)})`
}

export const createFluidValue = (
  minValue: number,
  maxValue: number,
  minWidth = 320,
  maxWidth = 1280
) => {
  const slope = (maxValue - minValue) / (maxWidth - minWidth)
  const preferred = slope * 100
  return clamp(minValue, preferred, maxValue)
}
