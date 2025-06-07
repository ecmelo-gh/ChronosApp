import { prisma } from '@/lib/prisma'
import { SessionCrypto } from './session-crypto'
import { addHours, isBefore } from 'date-fns'

const SESSION_DURATION_HOURS = 24
const sessionCrypto = new SessionCrypto()

export class SessionManager {
  static async createSession(userId: string, metadata: any = {}) {
    const expiresAt = addHours(new Date(), SESSION_DURATION_HOURS)
    const sessionData = {
      userId,
      metadata,
      createdAt: new Date(),
      expiresAt
    }

    // Encrypt session data
    const encryptedData = sessionCrypto.encrypt(sessionData)

    // Create session in database
    const session = await prisma.sessions.create({
      data: {
        id: crypto.randomUUID(),
        sessionToken: encryptedData,
        userId,
        expires: expiresAt
      }
    })

    return session.sessionToken
  }

  static async getSession(sessionToken: string) {
    // Get session from database
    const session = await prisma.sessions.findFirst({
      where: { sessionToken }
    })

    if (!session) return null

    // Check if session is expired
    if (isBefore(session.expires, new Date())) {
      await this.destroySession(sessionToken)
      return null
    }

    // Decrypt session data
    const decrypted = sessionCrypto.decrypt(session.sessionToken)
    if (!decrypted) {
      await this.destroySession(sessionToken)
      return null
    }

    return decrypted
  }

  static async updateSession(sessionToken: string, metadata: any) {
    const session = await this.getSession(sessionToken)
    if (!session) return null

    const updatedData = {
      ...session,
      metadata: {
        ...session.metadata,
        ...metadata
      }
    }

    // Encrypt updated data
    const encryptedData = sessionCrypto.encrypt(updatedData)

    // Update session in database
    await prisma.sessions.update({
      where: { sessionToken },
      data: { sessionToken: encryptedData }
    })

    return updatedData
  }

  static async destroySession(sessionToken: string) {
    await prisma.sessions.delete({
      where: { sessionToken }
    })
  }

  static async cleanupExpiredSessions() {
    const now = new Date()
    await prisma.sessions.deleteMany({
      where: { expires: { lt: now } }
    })
  }
}
