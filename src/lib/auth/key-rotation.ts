import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

interface EncryptionKey {
  id: string
  key: string
  createdAt: Date
  expiresAt: Date
  active: boolean
}

export class KeyRotationManager {
  private generateKey(): string {
    return randomBytes(32).toString('base64')
  }

  static async rotateKey(): Promise<void> {
    const newKey = new KeyRotationManager().generateKey()

    // Deactivate all current keys
    await prisma.$executeRaw`
      UPDATE encryption_keys SET active = false WHERE active = true
    `

    // Create new active key
    await prisma.$executeRaw`
      INSERT INTO encryption_keys (id, key, active, created_at, updated_at)
      VALUES (gen_random_uuid(), ${newKey}, true, NOW(), NOW())
    `
  }

  static async getCurrentKey(): Promise<string> {
    const activeKey = await prisma.$queryRaw<{ key: string }[]>`
      SELECT key FROM encryption_keys WHERE active = true ORDER BY created_at DESC LIMIT 1
    `

    if (!activeKey || activeKey.length === 0) {
      throw new Error('No active encryption key found')
    }

    return activeKey[0].key
  }

  static async cleanupExpiredKeys(): Promise<void> {
    const retentionPeriod = new Date()
    retentionPeriod.setDate(retentionPeriod.getDate() - 7) // Keep expired keys for 7 days

    await prisma.$executeRaw`
      DELETE FROM encryption_keys WHERE active = false AND expires_at < ${retentionPeriod}
    `
  }
  }

