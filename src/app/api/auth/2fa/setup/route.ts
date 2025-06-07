import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { TwoFactorAuth } from '@/lib/auth/2fa'
import { decrypt, hashCode } from '@/lib/crypto'

export async function POST() {
  const session = await getServerSession()
  if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

  // Gerar novo secret
  const secret = await TwoFactorAuth.generateSecret(session.user.id)
  const backupCodes = TwoFactorAuth.generateBackupCodes()

  // Criar registro 2FA
  await prisma.user_2fa.create({
    data: {
      userId: session.user.id,
      secret,
      backupCodes: backupCodes.map(code => hashCode(code)),
    }
  })

  // Gerar QR code
  const qrCode = await TwoFactorAuth.generateQRCode(
    session.user.email,
    secret
  )

  return Response.json({ 
    qrCode,
    backupCodes, // Mostrar apenas uma vez
    secret: decrypt(secret) // Mostrar apenas uma vez
  })
}
