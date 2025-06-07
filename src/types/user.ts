import { Prisma } from '@prisma/client'

export type User = Prisma.usersGetPayload<{
  select: {
    id: true
    email: true
    name: true
    image: true
    emailVerified: true
    password: true
    encrypted_password: true
    raw_user_meta_data: true
    user_2fa: {
      select: {
        id: true
        secret: true
        backupCodes: true
        enabled: true
        verified: true
        recoveryEmail: true
        lastUsed: true
      }
    }
  }
}>
