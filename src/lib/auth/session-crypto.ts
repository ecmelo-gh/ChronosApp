import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16
const ENCODING = 'base64'

export class SessionCrypto {
  private key: Buffer

  constructor() {
    const secret = process.env.SESSION_ENCRYPTION_KEY
    if (!secret || secret.length < 32) {
      throw new Error('SESSION_ENCRYPTION_KEY must be at least 32 bytes')
    }
    this.key = Buffer.from(secret, 'utf-8')
  }

  encrypt(data: any): string {
    // Generate random IV
    const iv = randomBytes(IV_LENGTH)
    
    // Create cipher
    const cipher = createCipheriv(ALGORITHM, this.key, iv)
    
    // Encrypt data
    const serialized = JSON.stringify(data)
    const encrypted = Buffer.concat([
      cipher.update(serialized, 'utf8'),
      cipher.final()
    ])
    
    // Get auth tag
    const authTag = cipher.getAuthTag()
    
    // Combine IV + encrypted data + auth tag
    const combined = Buffer.concat([
      iv,
      encrypted,
      authTag
    ])
    
    return combined.toString(ENCODING)
  }

  decrypt(encrypted: string): any {
    try {
      const combined = Buffer.from(encrypted, ENCODING)
      
      // Extract IV, encrypted data and auth tag
      const iv = combined.subarray(0, IV_LENGTH)
      const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH)
      const encryptedData = combined.subarray(
        IV_LENGTH,
        combined.length - AUTH_TAG_LENGTH
      )
      
      // Create decipher
      const decipher = createDecipheriv(ALGORITHM, this.key, iv)
      decipher.setAuthTag(authTag)
      
      // Decrypt data
      const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final()
      ])
      
      return JSON.parse(decrypted.toString('utf8'))
    } catch (error) {
      console.error('Session decryption failed:', error)
      return null
    }
  }

  // Rotate encryption key
  static async rotateKey(): Promise<string> {
    const newKey = randomBytes(32).toString('base64')
    // TODO: Implement key rotation logic with database
    return newKey
  }
}
