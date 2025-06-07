'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Chrome, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function ImportGoogleContacts() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      // Redirecionar para a rota de autenticação do Google
      window.location.href = '/api/auth/google/contacts'
    } catch (error) {
      console.error('Error starting Google import:', error)
      toast({
        title: "Erro na importação",
        description: "Não foi possível iniciar a importação dos contatos. Tente novamente.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Chrome className="mr-2 h-4 w-4" />
      )}
      Importar Contatos do Google
    </Button>
  )
}
