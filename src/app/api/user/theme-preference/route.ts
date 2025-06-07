import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbActions } from '@/lib/db/client'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return errorResponse('UNAUTHORIZED', 'Not authenticated', undefined, 401)
  }

  const user = await dbActions.users.findByEmail(session.user.email)
  if (!user) {
    return errorResponse('NOT_FOUND', 'User not found', undefined, 404)
  }

  return successResponse({ theme_preference: user.theme_preference })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return errorResponse('UNAUTHORIZED', 'Not authenticated', undefined, 401)
  }

  const data = await req.json()
  const { theme } = data

  if (!theme || !['light', 'dark', 'system'].includes(theme)) {
    return errorResponse('BAD_REQUEST', 'Invalid theme value', undefined, 400)
  }

  const user = await dbActions.users.findByEmail(session.user.email)
  if (!user) {
    return errorResponse('NOT_FOUND', 'User not found', undefined, 404)
  }

  await dbActions.users.updateThemePreference(user.id, theme)

  return successResponse({ message: 'Theme preference updated successfully' })
}
