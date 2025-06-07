'use client'

import { ThemeToggle } from '../ThemeToggle'
import { Container } from './Container'
import { Flex } from './Flex'

export function Header() {
  return (
    <header className="border-b border-border bg-background">
      <Container>
        <Flex align="center" justify="between" css={{ height: '4rem' }}>
          <div>
            {/* Logo or brand */}
            <h1 className="text-xl font-semibold">Sistema de Gestão</h1>
          </div>

          <Flex align="center" gap={2}>
            {/* Navigation items can go here */}
            <ThemeToggle />
          </Flex>
        </Flex>
      </Container>
    </header>
  )
}
