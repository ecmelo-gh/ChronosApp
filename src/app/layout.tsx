import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Toaster } from 'sonner'
import 'antd/dist/reset.css'
import './globals.css'
import '../styles/fonts.css'
import { Providers } from './providers'
import { Header } from '@/components/layout/Header'

const inter = localFont({
  src: [
    {
      path: '../../public/fonts/inter-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/inter-medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/inter-semibold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/inter-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
  preload: true,
})

export const metadata: Metadata = {
  title: 'Sistema de Gestão',
  description: 'Sistema de gestão empresarial completo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body>
        <Providers>
          <Header />
          <main>
            {children}
          </main>
        </Providers>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  )
}
