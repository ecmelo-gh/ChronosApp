import { TwoFactorAuth } from '@/lib/auth/2fa'
import { authenticator } from 'otplib'
import { decrypt } from '@/lib/crypto'

describe('TwoFactorAuth', () => {
  const userId = 'test-user-id'
  let secret: string
  let backupCodes: string[]

  beforeEach(async () => {
    secret = await TwoFactorAuth.generateSecret(userId)
    backupCodes = TwoFactorAuth.generateBackupCodes()
  })

  describe('generateSecret', () => {
    it('should generate an encrypted secret', async () => {
      expect(secret).toBeDefined()
      const decrypted = decrypt(secret)
      expect(decrypted.length).toBe(32)
    })
  })

  describe('generateBackupCodes', () => {
    it('should generate 6 backup codes', () => {
      expect(backupCodes.length).toBe(6)
      backupCodes.forEach(code => {
        expect(code.length).toBe(8)
      })
    })
  })

  describe('generateQRCode', () => {
    it('should generate a valid QR code URL', async () => {
      const email = 'test@example.com'
      const qrCode = await TwoFactorAuth.generateQRCode(email, secret)
      expect(qrCode).toMatch(/^data:image\/png;base64,/)
    })
  })

  describe('verifyToken', () => {
    it('should verify valid TOTP token', async () => {
      const decryptedSecret = decrypt(secret)
      const token = authenticator.generate(decryptedSecret)
      const isValid = TwoFactorAuth.verifyToken(token, secret)
      expect(isValid).toBe(true)
    })

    it('should reject invalid TOTP token', () => {
      const isValid = TwoFactorAuth.verifyToken('000000', secret)
      expect(isValid).toBe(false)
    })
  })

  describe('verifyBackupCode', () => {
    it('should verify valid backup code', async () => {
      const code = backupCodes[0]
      const hashedCodes = backupCodes.map(c => TwoFactorAuth.hashCode(c))
      const isValid = await TwoFactorAuth.verifyBackupCode(code, hashedCodes)
      expect(isValid).toBe(true)
    })

    it('should reject invalid backup code', async () => {
      const hashedCodes = backupCodes.map(c => TwoFactorAuth.hashCode(c))
      const isValid = await TwoFactorAuth.verifyBackupCode('invalid', hashedCodes)
      expect(isValid).toBe(false)
    })
  })
})
