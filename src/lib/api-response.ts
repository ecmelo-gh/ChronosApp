type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR'

export function successResponse(data: any) {
  return Response.json({ success: true, ...data })
}

export function errorResponse(
  code: ErrorCode,
  message: string,
  details?: any,
  status = 500
) {
  return Response.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  )
}
