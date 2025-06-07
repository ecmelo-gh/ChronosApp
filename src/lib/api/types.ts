import { NextRequest } from 'next/server'

declare module 'next/server' {
  interface NextRequest {
    auth: {
      id: string
      // Add other auth properties as needed
    }
  }
}
