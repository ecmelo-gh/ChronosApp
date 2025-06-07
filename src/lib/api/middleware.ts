import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { zodErrorResponse } from './responses'

type RouteHandler = (req: NextRequest, context?: any) => Promise<NextResponse> | NextResponse

/**
 * Middleware para validar o body da requisição usando um schema Zod
 */
export function validateRequest(schema: z.ZodType, handler: RouteHandler): RouteHandler {
  return async (req: NextRequest) => {
    try {
      let body = {}
      
      // Se tiver body, tenta fazer o parse
      if (req.body) {
        const rawBody = await req.json()
        body = await schema.parseAsync(rawBody)
      }
      
      // Cria uma nova NextRequest com o body validado
      const validatedReq = new NextRequest(req.url, {
        headers: req.headers,
        method: req.method,
        body: JSON.stringify(body),
        // Preserva as propriedades específicas do Next.js
        signal: req.signal,
        credentials: req.credentials,
        cache: req.cache,
        redirect: req.redirect,
        referrer: req.referrer,
        referrerPolicy: req.referrerPolicy,
        integrity: req.integrity,
        keepalive: req.keepalive,
        mode: req.mode
      })

      return handler(validatedReq)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return zodErrorResponse(error)
      }
      throw error
    }
  }
}

/**
 * Middleware para validar query params usando um schema Zod
 */
export function validateQuery(schema: z.ZodType, handler: RouteHandler): RouteHandler {
  return async (req: NextRequest) => {
    try {
      const url = new URL(req.url)
      const queryParams = Object.fromEntries(url.searchParams)
      const validatedQuery = await schema.parseAsync(queryParams)

      // Injeta os query params validados na URL
      const validatedUrl = new URL(req.url)
      Object.entries(validatedQuery).forEach(([key, value]) => {
        if (value !== undefined) {
          validatedUrl.searchParams.set(key, String(value))
        }
      })

      const validatedReq = new NextRequest(validatedUrl, {
        headers: req.headers,
        method: req.method,
        // Preserva as propriedades específicas do Next.js
        signal: req.signal,
        credentials: req.credentials,
        cache: req.cache,
        redirect: req.redirect,
        referrer: req.referrer,
        referrerPolicy: req.referrerPolicy,
        integrity: req.integrity,
        keepalive: req.keepalive,
        mode: req.mode
      })
      return handler(validatedReq)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return zodErrorResponse(error)
      }
      throw error
    }
  }
}

/**
 * Middleware para tratar erros nas rotas
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest) => {
    try {
      return await handler(req)
    } catch (error) {
      console.error('Route error:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro interno do servidor',
          },
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Middleware para autenticação de rotas
 * Verifica se o usuário está autenticado antes de prosseguir
 */
export function withAuth(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest) => {
    // Verifica o token de autenticação
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Autenticação necessária',
          },
        },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer '
    
    try {
      // TODO: Implementar verificação do token JWT
      // const decoded = await verifyToken(token)
      // if (!decoded) throw new Error('Token inválido')
      
      // Mock do decoded token para desenvolvimento
      const decoded = { id: 'mock-user-id' }
      
      // Injeta o usuário autenticado no request
      const authenticatedReq = new NextRequest(req.url, {
        headers: req.headers,
        method: req.method,
        body: req.body,
        signal: req.signal,
        credentials: req.credentials,
        cache: req.cache,
        redirect: req.redirect,
        referrer: req.referrer,
        referrerPolicy: req.referrerPolicy,
        integrity: req.integrity,
        keepalive: req.keepalive,
        mode: req.mode
      }) as NextRequest & { auth: { id: string } }
      
      // Set auth property
      authenticatedReq.auth = {
        id: 'user-123' // TODO: Get this from JWT token verification
      }

      // Attach auth information
      Object.defineProperty(authenticatedReq, 'auth', {
        value: {
          id: decoded.id,
          // Add other auth properties as needed
        },
        writable: false,
        configurable: false
      })

      return handler(authenticatedReq)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token de autenticação inválido',
          },
        },
        { status: 401 }
      )
    }
  }
}
