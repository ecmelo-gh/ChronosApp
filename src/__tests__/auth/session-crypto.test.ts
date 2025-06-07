import { SessionCrypto } from '@/lib/auth/session-crypto'

describe('SessionCrypto', () => {
  let sessionCrypto: SessionCrypto

  beforeEach(() => {
    process.env.SESSION_ENCRYPTION_KEY = 'test-key-must-be-32-bytes-long-keys'
    sessionCrypto = new SessionCrypto()
  })

  describe('constructor', () => {
    it('should throw error if encryption key is missing', () => {
      delete process.env.SESSION_ENCRYPTION_KEY
      expect(() => new SessionCrypto()).toThrow('SESSION_ENCRYPTION_KEY must be at least 32 bytes')
    })

    it('should throw error if encryption key is too short', () => {
      process.env.SESSION_ENCRYPTION_KEY = 'short-key'
      expect(() => new SessionCrypto()).toThrow('SESSION_ENCRYPTION_KEY must be at least 32 bytes')
    })
  })

  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt data correctly', () => {
      const testData = {
        userId: 'test-user',
        metadata: { role: 'admin' }
      }

      const encrypted = sessionCrypto.encrypt(testData)
      expect(encrypted).toBeDefined()
      expect(typeof encrypted).toBe('string')

      const decrypted = sessionCrypto.decrypt(encrypted)
      expect(decrypted).toEqual(testData)
    })

    it('should handle complex objects', () => {
      const testData = {
        userId: 'test-user',
        metadata: {
          role: 'admin',
          permissions: ['read', 'write'],
          lastAccess: new Date().toISOString(),
          settings: {
            theme: 'dark',
            notifications: true
          }
        }
      }

      const encrypted = sessionCrypto.encrypt(testData)
      const decrypted = sessionCrypto.decrypt(encrypted)
      expect(decrypted).toEqual(testData)
    })

    it('should return null for invalid encrypted data', () => {
      const decrypted = sessionCrypto.decrypt('invalid-data')
      expect(decrypted).toBeNull()
    })

    it('should generate different ciphertexts for same data', () => {
      const testData = { userId: 'test-user' }
      const encrypted1 = sessionCrypto.encrypt(testData)
      const encrypted2 = sessionCrypto.encrypt(testData)
      expect(encrypted1).not.toBe(encrypted2)
    })
  })

  describe('key rotation', () => {
    it('should generate valid new key', async () => {
      const newKey = await SessionCrypto.rotateKey()
      expect(newKey).toBeDefined()
      expect(typeof newKey).toBe('string')
      expect(Buffer.from(newKey, 'base64').length).toBeGreaterThanOrEqual(32)
    })
  })
})
