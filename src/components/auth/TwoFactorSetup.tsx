'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from "@/hooks/use-toast"
import Image from 'next/image'

export function TwoFactorSetup() {
  const { toast } = useToast()
  const [step, setStep] = useState<'init'|'verify'>('init')
  const [qrCode, setQrCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSetup = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/auth/2fa/setup', {
        method: 'POST'
      })
      
      if (!res.ok) throw new Error('Failed to setup 2FA')
      
      const data = await res.json()
      setQrCode(data.qrCode)
      setBackupCodes(data.backupCodes)
      setStep('verify')
      
      toast({
        title: '2FA Setup Started',
        description: 'Scan the QR code with your authenticator app',
        variant: 'default'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to setup 2FA. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })
      
      if (!res.ok) throw new Error('Failed to verify 2FA')
      
      const { success } = await res.json()
      
      if (success) {
        toast({
          title: '2FA Enabled',
          description: 'Two-factor authentication has been enabled for your account',
          variant: 'default'
        })
        // Redirecionar ou atualizar UI
      } else {
        toast({
          title: 'Invalid Code',
          description: 'The code you entered is invalid. Please try again.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify 2FA. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-4">
      {step === 'init' ? (
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-4">Enable Two-Factor Authentication</h2>
          <p className="text-sm text-gray-600 mb-4">
            Two-factor authentication adds an extra layer of security to your account
          </p>
          <Button 
            onClick={handleSetup}
            disabled={loading}
          >
            {loading ? 'Setting up...' : 'Configure 2FA'}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Scan QR Code</h2>
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code with your authenticator app
            </p>
            {qrCode && (
              <div className="flex justify-center mb-4">
                <Image
                  src={qrCode}
                  alt="2FA QR Code"
                  width={200}
                  height={200}
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-md font-semibold">Backup Codes</h3>
            <p className="text-sm text-gray-600">
              Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map(code => (
                <div 
                  key={code} 
                  className="p-2 bg-gray-50 border rounded text-center font-mono text-sm"
                >
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-md font-semibold">Verify Setup</h3>
            <p className="text-sm text-gray-600">
              Enter the code from your authenticator app to complete setup
            </p>
            <Input
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="text-center text-lg tracking-wide"
            />
            <Button 
              onClick={handleVerify}
              disabled={loading || token.length !== 6}
              className="w-full"
            >
              {loading ? 'Verifying...' : 'Verify and Enable 2FA'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
