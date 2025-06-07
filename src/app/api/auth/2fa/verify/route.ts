import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { TwoFactorAuth } from '@/lib/auth/2fa'
import { RateLimit } from '@/lib/rate-limit'
import { hashCode } from '@/lib/crypto'

const verify2FALimit = new RateLimit({
  maxRequests: 5,
  interval: 15 * 60, // 15 minutes
}, '2fa-verify')

export async function POST(req: Request) {
  const { token } = await req.json()
  const session = await getServerSession()
  
  // Check rate limit
  const { success, remaining } = await verify2FALimit.check(session?.user?.id || req.headers.get('x-forwarded-for') || 'anonymous')
  if (!success) {
    return new Response('Too many attempts', { 
      status: 429,
      headers: { 'Retry-After': '900' } // 15 minutes
    })
  }
  
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const twoFactor = await prisma.user_2fa.findUnique({
    where: { userId: session.user.id }
  })

  if (!twoFactor) 
    return new Response('2FA not setup', { status: 400 })

  // Try TOTP first
  let isValid = TwoFactorAuth.verifyToken(token, twoFactor.secret)
  
  // If TOTP fails, try backup code
  if (!isValid) {
    isValid = await TwoFactorAuth.verifyBackupCode(token, twoFactor.backupCodes)
    
    // If backup code is valid, remove it from the list
    if (isValid) {
      const hashedToken = await hashCode(token)
      const newBackupCodes = twoFactor.backupCodes.filter(
        code => code !== hashedToken
      )
      
      await prisma.user_2fa.update({
        where: { id: twoFactor.id },
        data: { backupCodes: newBackupCodes }
      })
    }
  }

  if (isValid) {
    await prisma.user_2fa.update({
      where: { id: twoFactor.id },
      data: { 
        verified: true,
        enabled: true,
        lastUsed: new Date()
      }
    })
  }

  return Response.json({ success: isValid })
}
