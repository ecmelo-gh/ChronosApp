import { memo, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Star, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCustomer } from '@/hooks/useCustomers'
import { toast } from 'react-hot-toast'
import { FeedbackBadge } from './FeedbackBadge'
import { ProfessionalPreferences } from './ProfessionalPreferences'

// Schema otimizado e reutilizável
const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(3).max(500),
  professionalId: z.string().optional()
})

type FeedbackFormData = z.infer<typeof feedbackSchema>

interface FeedbackSectionProps {
  customerId: string
  professionals: {
    id: string
    name: string
    imageUrl?: string
    role: string
  }[]
}

// Componente otimizado com memo
const FeedbackSection = memo(({ customerId, professionals }: FeedbackSectionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addFeedback, deleteFeedback, customer } = useCustomer(customerId)

  // Form com validação otimizada
  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 5,
      comment: '',
      professionalId: undefined
    }
  })

  // Handlers memorizados
  const onSubmit = useMemo(() => 
    async (data: FeedbackFormData) => {
      try {
        setIsSubmitting(true)
        await addFeedback({
          rating: data.rating,
          comment: data.comment,
          source: 'APP'
        })
        form.reset()
        toast.success('Feedback enviado com sucesso!')
      } catch (error) {
        toast.error('Erro ao enviar feedback')
      } finally {
        setIsSubmitting(false)
      }
    }, 
    [addFeedback, form]
  )

  const handleDelete = async (feedbackId: string) => {
    try {
      await deleteFeedback(feedbackId)
      toast.success('Feedback removido com sucesso!')
    } catch (error) {
      toast.error('Erro ao remover feedback')
    }
  }

  // Renderização condicional otimizada
  if (!customer) return null

  // Transformar visitas em formato esperado pelo ProfessionalPreferences
  const recentVisits = customer?.visits?.map(visit => ({
    id: visit.id,
    date: new Date(visit.date),
    professional: visit.professional,
    services: visit.services.map(s => s.name)
  })) || []

  return (
    <div className="space-y-8">
      {/* Preferências de Profissionais */}
      <ProfessionalPreferences
        customerId={customerId}
        professionals={professionals}
        recentVisits={recentVisits}
      />

      {/* Formulário de Feedback */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Novo Feedback</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avaliação</FormLabel>
                  <FormControl>
                    <div role="group" aria-label="Rating" className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          aria-label={`Rate ${rating} stars`}
                          onClick={() => field.onChange(rating)}
                          className={cn(
                            'p-1 hover:scale-110 transition-transform',
                            'focus:outline-none focus:ring-2 focus:ring-primary',
                            field.value >= rating ? 'active' : ''
                          )}
                        >
                          <Star
                            className={cn(
                              'w-8 h-8',
                              field.value >= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentário</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      placeholder="Digite seu feedback..."
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Feedback comment"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
            </Button>
          </form>
        </Form>
      </div>

      {/* Lista de Feedbacks */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Histórico de Feedbacks</h3>
        {customer?.feedback?.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nenhum feedback registrado.
          </p>
        ) : (
          <div className="space-y-4">
            {customer?.feedback?.map((feedback) => (
              <div
                key={feedback.id}
                className="rounded-lg border p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-5 h-5',
                            i < feedback.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <FeedbackBadge source={feedback.source} />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(feedback.id)}
                  >
                    <Trash2 className="w-4 h-4 text-gray-500" />
                  </Button>
                </div>
                <p className="text-sm">{feedback.comment}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {new Date(feedback.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  {feedback.createdBy?.name && (
                    <span>por {feedback.createdBy.name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

FeedbackSection.displayName = 'FeedbackSection'

export default FeedbackSection
