import { useCallback, useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'

// Schema compartilhado
export const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(3).max(500),
  source: z.enum(['APP', 'WEB', 'API']),
  professionalId: z.string().optional()
})

export type FeedbackData = z.infer<typeof feedbackSchema>

// Keys de cache otimizadas
const FEEDBACK_KEYS = {
  all: ['feedback'] as const,
  byCustomer: (customerId: string) => [...FEEDBACK_KEYS.all, customerId] as const,
  byProfessional: (professionalId: string) => [...FEEDBACK_KEYS.all, 'professional', professionalId] as const
}

// Hook otimizado
export function useFeedback(customerId: string) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<Error | null>(null)

  // Mutation otimizada
  const { mutate: addFeedback, isLoading } = useMutation({
    mutationFn: async (data: FeedbackData) => {
      const response = await fetch(`/api/customers/${customerId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Invalidação seletiva de cache
      queryClient.invalidateQueries(FEEDBACK_KEYS.byCustomer(customerId))
      if (data.professionalId) {
        queryClient.invalidateQueries(FEEDBACK_KEYS.byProfessional(data.professionalId))
      }

      toast.success('Feedback enviado com sucesso!')
      setError(null)
    },
    onError: (error: Error) => {
      toast.error('Erro ao enviar feedback')
      setError(error)
    }
  })

  // Handlers otimizados
  const handleAddFeedback = useCallback(
    async (data: FeedbackData) => {
      try {
        await addFeedback(data)
        return true
      } catch (err) {
        return false
      }
    },
    [addFeedback]
  )

  return {
    addFeedback: handleAddFeedback,
    isLoading,
    error
  }
}
