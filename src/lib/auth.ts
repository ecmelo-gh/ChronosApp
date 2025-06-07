import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions, Session, User } from "next-auth"
import { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import { compare } from "bcryptjs"
import { AuthEventType, Prisma, users } from "@prisma/client"
import { TwoFactorAuth as TwoFactorAuthUtil } from "./auth/2fa"
import crypto from "crypto"

export type UserWithTwoFactor = users & {
  user_2fa?: {
    id: string
    userId: string
    secret: string
    backupCodes: string[]
    enabled: boolean
    verified: boolean
    recoveryEmail: string | null
    lastUsed: Date | null
    created_at: Date
    updated_at: Date
  } | null
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      has2fa?: boolean
      is2faVerified?: boolean
    }
  }

  interface User {
    id: string
    name: string | null
    email: string | null
    emailVerified: Date | null
    image: string | null
    password: string
    user_2fa: {
      id: string
      userId: string
      secret: string
      backupCodes: string[]
      enabled: boolean
      verified: boolean
      recoveryEmail: string | null
      lastUsed: Date | null
      created_at: Date
      updated_at: Date
    } | null
    encrypted_password: string
    raw_user_meta_data: Prisma.JsonValue
    requiresVerification: boolean
  }

  interface JWT {
    id: string
    has2fa?: boolean
    is2faVerified?: boolean
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        code: { label: '2FA Code', type: 'text' }
      },
      async authorize(credentials: Record<'email' | 'password' | 'code', string> | undefined): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
          include: { user_2fa: true }
        }) as UserWithTwoFactor | null

        if (!user || !user.password) {
          return null
        }

        const isValidPassword = await compare(credentials.password, user.password)

        if (!isValidPassword) {
          await prisma.audit_logs.create({
            data: {
              id: crypto.randomUUID(),
              userId: user.id,
              eventType: AuthEventType.AUTH_LOGIN_FAILURE,
              metadata: {
                type: AuthEventType.AUTH_LOGIN_FAILURE,
                attempts: 1,
                threshold: 5
              },
              action: AuthEventType.AUTH_LOGIN_FAILURE,
              resourceId: user.id
            }
          })
          return null
        }

        if (user.user_2fa?.enabled && !user.user_2fa?.verified) {
          if (!credentials.code) {
            return null
          }

          const isValidToken = TwoFactorAuthUtil.verifyToken(user.user_2fa.secret, credentials.code)

          if (!isValidToken) {
            await prisma.audit_logs.create({
              data: {
                id: crypto.randomUUID(),
                userId: user.id,
                eventType: AuthEventType.AUTH_2FA_FAILURE,
                action: AuthEventType.AUTH_2FA_FAILURE,
                resourceId: user.id,
                metadata: {
                  type: AuthEventType.AUTH_2FA_FAILURE,
                  attempts: 1,
                  threshold: 5
                }
              }
            })
            return null
          }
        }

        const userToReturn: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          password: user.password,
          user_2fa: user.user_2fa || null,
          encrypted_password: user.encrypted_password,
          raw_user_meta_data: user.raw_user_meta_data,
          requiresVerification: user.requiresVerification
        }
        return userToReturn
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && 'id' in user) {
        const dbUser = await prisma.users.findUnique({
          where: { id: user.id },
          include: { user_2fa: true }
        }) as UserWithTwoFactor | null

        if (dbUser) {
          token.id = dbUser.id
          token.has2fa = !!dbUser.user_2fa?.enabled
          token.is2faVerified = !!dbUser.user_2fa?.verified
        }
      }
      return token
    },
    async session({ session, token }) {
      if (!session?.user) return session

      const dbUser = await prisma.users.findUnique({
        where: { id: token.id as string },
        include: { user_2fa: true }
      })

      if (!dbUser) return session

      session.user = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        has2fa: !!dbUser.user_2fa?.enabled,
        is2faVerified: !!dbUser.user_2fa?.verified
      }

      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  }
}
