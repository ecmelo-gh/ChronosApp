import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { UserWithTwoFactor } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import { TwoFactorAuth } from '@/lib/auth/2fa'
import { RateLimit } from '@/lib/rate-limit'
import { disable2FASchema } from '@/schemas/auth/2fa.schema'

const disable2FALimit = new RateLimit({
  maxRequests: 5,
  windowInSeconds: 15 * 60, // 15 minutes
  message: 'Muitas tentativas. Tente novamente em 15 minutos.'
}, '2fa-disable')

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  // Check rate limit
  const { success } = await disable2FALimit.check(session.user.id)
  if (!success) {
    return new Response('Too many attempts', { 
      status: 429,
      headers: { 'Retry-After': '900' } // 15 minutes
    })
  }

  try {
    const body = await req.json()
    const { password, code } = disable2FASchema.parse(body)

    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      include: {
        user_2fa: true
      }
    })

    if (!user?.user_2fa?.enabled) {
      return new Response('2FA not enabled', { status: 400 })
    }

    // Verify code
    const isValid = TwoFactorAuth.verifyToken(code, user.user_2fa.secret)
    if (!isValid) {
      return new Response('Invalid code', { status: 400 })
    }

    // Disable 2FA
    await prisma.user_2fa.update({
      where: { id: user.user_2fa.id },
      data: {
        enabled: false,
        verified: false,
        backupCodes: []
      }
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error disabling 2FA:', error)
    return new Response('Invalid request', { status: 400 })
  }
}
