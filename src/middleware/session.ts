import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SessionManager } from '@/lib/auth/session-manager'

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('next-auth.session-token')?.value

  // Skip session validation for public routes
  if (request.nextUrl.pathname.startsWith('/api/auth') ||
      request.nextUrl.pathname === '/login') {
    return NextResponse.next()
  }

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Validate session
  const session = await SessionManager.getSession(sessionToken)
  if (!session) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('next-auth.session-token')
    return response
  }

  // Add session data to request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', session.userId)

  // Add 2FA status if needed
  if (session.metadata?.twoFactorEnabled) {
    requestHeaders.set('x-2fa-enabled', 'true')
    requestHeaders.set('x-2fa-verified', session.metadata.twoFactorVerified ? 'true' : 'false')
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (authentication routes)
     * 2. /_next/* (Next.js internals)
     * 3. /fonts/* (static font files)
     * 4. /images/* (static image files)
     * 5. /favicon.ico, /site.webmanifest (static files)
     */
    '/((?!api/auth|_next|fonts|images|favicon.ico|site.webmanifest).*)',
  ],
}
