import { PrismaClient, AuthEventType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const FAILED_ATTEMPTS_THRESHOLD = 5
const MONITORING_WINDOW = 15 * 60 // 15 minutes

export class AuthMonitor {
  static async logAuthAttempt(userId: string, success: boolean, type: 'login' | '2fa' | 'password_reset', metadata: any = {}) {
    // Log to database
    await prisma.audit_logs.create({
      data: {
        userId,
        eventType: success ? AuthEventType.AUTH_LOGIN_SUCCESS : AuthEventType.AUTH_LOGIN_FAILURE,
        metadata: metadata,
        timestamp: new Date()
      }
    })

    if (!success) {
      await this.trackFailedAttempt(userId, type)
    }
  }

  static async trackFailedAttempt(userId: string, type: string) {
    const key = `auth:failed:${type}:${userId}`
    
    // Increment failed attempts counter
    const attempts = await redis.incr(key)
    await redis.expire(key, MONITORING_WINDOW)

    if (attempts >= FAILED_ATTEMPTS_THRESHOLD) {
      await this.handleSuspiciousActivity(userId, type, attempts)
    }
  }

  private static async handleSuspiciousActivity(userId: string, type: string, attempts: number) {
    // Log suspicious activity
    await prisma.audit_logs.create({
      data: {
        userId,
        eventType: AuthEventType.SUSPICIOUS_ACTIVITY_DETECTED,
        metadata: {
          type,
          attempts,
          threshold: FAILED_ATTEMPTS_THRESHOLD
        },
        timestamp: new Date()
      }
    })

    // Implement additional security measures
    switch (type) {
      case 'login':
        await this.temporarilyLockAccount(userId)
        break
      case '2fa':
        await this.require2FAVerification(userId)
        break
      case 'password_reset':
        await this.blockPasswordReset(userId)
        break
    }
  }

  private static async temporarilyLockAccount(userId: string) {
    const lockKey = `auth:lock:${userId}`
    await redis.set(lockKey, 'locked', { ex: 3600 }) // 1 hour lock
  }

  private static async require2FAVerification(userId: string) {
    await prisma.users.update({
      where: { id: userId },
      data: {
        requiresVerification: true
      }
    })
  }

  private static async blockPasswordReset(userId: string) {
    const blockKey = `auth:block_reset:${userId}`
    await redis.set(blockKey, 'blocked', { ex: 7200 }) // 2 hour block
  }

  static async isAccountLocked(userId: string): Promise<boolean> {
    const lockKey = `auth:lock:${userId}`
    return (await redis.get(lockKey)) !== null
  }

  static async getFailedAttempts(userId: string, type: string): Promise<number> {
    const key = `auth:failed:${type}:${userId}`
    const attempts = await redis.get(key)
    return attempts ? parseInt(attempts as string) : 0
  }

  static async resetFailedAttempts(userId: string, type: string): Promise<void> {
    const key = `auth:failed:${type}:${userId}`
    await redis.del(key)
  }
}
