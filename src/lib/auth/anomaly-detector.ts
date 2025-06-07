import { PrismaClient, AuthEventType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Redis } from '@upstash/redis'
import geoip from 'geoip-lite'

const redis = Redis.fromEnv()

interface LoginMetadata {
  ip: string
  userAgent: string
  timestamp: number
}

export class AnomalyDetector {
  static async analyzeLogin(userId: string, ip: string, userAgent: string): Promise<boolean> {
    const key = `auth:login_patterns:${userId}`
    const currentLogin: LoginMetadata = { ip, userAgent, timestamp: Date.now() }
    
    // Get user's login history
    const loginHistory = await this.getLoginHistory(userId)
    
    // Check for anomalies
    const anomalies = await this.detectAnomalies(currentLogin, loginHistory)
    
    if (anomalies.length > 0) {
      await this.logAnomaly(userId, anomalies, currentLogin)
      return true
    }

    // Update login history
    await this.updateLoginHistory(userId, currentLogin)
    return false
  }

  private static async getLoginHistory(userId: string): Promise<LoginMetadata[]> {
    const key = `auth:login_patterns:${userId}`
    const history = await redis.get(key)
    return history ? JSON.parse(history as string) : []
  }

  private static async detectAnomalies(
    current: LoginMetadata,
    history: LoginMetadata[]
  ): Promise<string[]> {
    const anomalies: string[] = []

    if (history.length === 0) return [] // First login

    const lastLogin = history[history.length - 1]
    const timeDiff = current.timestamp - lastLogin.timestamp
    const geoipCurrent = geoip.lookup(current.ip)
    const geoipLast = geoip.lookup(lastLogin.ip)

    // Detect rapid location change
    if (geoipCurrent && geoipLast && 
        geoipCurrent.country !== geoipLast.country && 
        timeDiff < 3600000) { // 1 hour
      anomalies.push('impossible_travel')
    }

    // Detect unusual login time
    const currentHour = new Date(current.timestamp).getHours()
    const isUnusualTime = !history.some(login => {
      const loginHour = new Date(login.timestamp).getHours()
      return Math.abs(loginHour - currentHour) <= 2
    })
    if (isUnusualTime) {
      anomalies.push('unusual_time')
    }

    // Detect new device
    const isNewDevice = !history.some(login => 
      login.userAgent === current.userAgent
    )
    if (isNewDevice) {
      anomalies.push('new_device')
    }

    return anomalies
  }

  private static async logAnomaly(
    userId: string,
    anomalies: string[],
    loginData: LoginMetadata
  ): Promise<void> {
    const lastLogin = await this.getLoginHistory(userId)
    const lastLoginIp = lastLogin[lastLogin.length - 1].ip
    const lastLocation = geoip.lookup(lastLoginIp)
    const currentLocation = geoip.lookup(loginData.ip)
    const timeDiff = loginData.timestamp - lastLogin[lastLogin.length - 1].timestamp

    await prisma.audit_logs.create({
      data: {
        userId,
        eventType: AuthEventType.AUTH_SUSPICIOUS_ACTIVITY,
        metadata: {
          ip: loginData.ip,
          userAgent: loginData.userAgent,
          reason: 'Suspicious activity detected',
          timestamp: new Date().toISOString()
        }
      }
    })
  }

  private static async updateLoginHistory(
    userId: string,
    loginData: LoginMetadata
  ): Promise<void> {
    const key = `auth:login_patterns:${userId}`
    const history = await this.getLoginHistory(userId)
    
    // Keep last 10 logins
    history.push(loginData)
    if (history.length > 10) {
      history.shift()
    }

    await redis.set(key, JSON.stringify(history), { ex: 30 * 24 * 3600 }) // 30 days
  }

  static async getAnomalyStats(userId: string): Promise<any> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentLogs = await prisma.audit_logs.findMany({
      where: {
        userId,
        eventType: AuthEventType.AUTH_LOGIN_FAILURE,
        created_at: {
          gte: new Date(Date.now() - 30 * 24 * 3600 * 1000)
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 10
    })

    return recentLogs
  }
}
