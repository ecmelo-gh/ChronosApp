import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import { encrypt, decrypt, hashCode } from '../crypto'
import crypto from 'crypto'

import { createHash } from 'crypto'

export class TwoFactorAuth {
  // Gerar secret TOTP
  static async generateSecret(userId: string): Promise<string> {
    const secret = authenticator.generateSecret()
    return encrypt(secret) // Encriptar antes de salvar
  }

  // Gerar backup codes
  static generateBackupCodes(): string[] {
    return Array.from({ length: 6 }, () => 
      crypto.randomBytes(4).toString('hex'))
  }

  // Gerar QR code
  static async generateQRCode(email: string, secret: string): Promise<string> {
    const otpauth = authenticator.keyuri(
      email,
      'Windsurf App',
      decrypt(secret)
    )
    return QRCode.toDataURL(otpauth)
  }

  // Verificar código TOTP
  static verifyToken(token: string, secret: string): boolean {
    return authenticator.verify({
      token,
      secret: decrypt(secret)
    })
  }

  static hashCode(code: string): string {
    return createHash('sha256').update(code).digest('hex')
  }

  // Verificar backup code
  static async verifyBackupCode(code: string, hashedCodes: string[]): Promise<boolean> {
    const hashedInput = TwoFactorAuth.hashCode(code)
    return hashedCodes.includes(hashedInput)
  }
}
