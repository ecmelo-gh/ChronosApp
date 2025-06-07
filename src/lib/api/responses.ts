import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

export type ApiErrorCode = 
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'TOO_MANY_REQUESTS'

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const

/**
 * Cria uma resposta de sucesso
 */
export function successResponse<T>(data: T, status = HTTP_STATUS.OK): NextResponse {
  const body: ApiResponse<T> = {
    success: true,
    data,
  }
  return NextResponse.json(body, { status })
}

/**
 * Cria uma resposta de erro
 */
export function errorResponse(
  code: ApiErrorCode,
  message: string,
  details?: any,
  status?: number
): NextResponse {
  const statusCode = status || getStatusFromCode(code)
  const body: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  }
  return NextResponse.json(body, { status: statusCode })
}

/**
 * Cria uma resposta de erro de validação do Zod
 */
export function zodErrorResponse(error: ZodError): NextResponse {
  return errorResponse(
    'VALIDATION_ERROR',
    'Dados inválidos',
    error.errors,
    HTTP_STATUS.BAD_REQUEST
  )
}

/**
 * Mapeia códigos de erro para status HTTP
 */
function getStatusFromCode(code: ApiErrorCode): number {
  switch (code) {
    case 'BAD_REQUEST':
      return HTTP_STATUS.BAD_REQUEST
    case 'UNAUTHORIZED':
      return HTTP_STATUS.UNAUTHORIZED
    case 'FORBIDDEN':
      return HTTP_STATUS.FORBIDDEN
    case 'NOT_FOUND':
      return HTTP_STATUS.NOT_FOUND
    case 'VALIDATION_ERROR':
      return HTTP_STATUS.BAD_REQUEST
    case 'INTERNAL_ERROR':
    default:
      return HTTP_STATUS.INTERNAL_ERROR
  }
}
