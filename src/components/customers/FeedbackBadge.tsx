import { cn } from '@/lib/utils'
import { MessageSquare, Mail, Phone, HelpCircle } from 'lucide-react'

type FeedbackSource = 'WHATSAPP' | 'EMAIL' | 'APP' | 'OTHER'

interface FeedbackBadgeProps {
  source: FeedbackSource
  className?: string
}

export function FeedbackBadge({ source, className }: FeedbackBadgeProps) {
  const config = {
    WHATSAPP: {
      icon: Phone,
      label: 'WhatsApp',
      className: 'bg-green-100 text-green-700'
    },
    EMAIL: {
      icon: Mail,
      label: 'Email',
      className: 'bg-blue-100 text-blue-700'
    },
    APP: {
      icon: MessageSquare,
      label: 'Aplicativo',
      className: 'bg-purple-100 text-purple-700'
    },
    OTHER: {
      icon: HelpCircle,
      label: 'Outro',
      className: 'bg-gray-100 text-gray-700'
    }
  }

  const { icon: Icon, label, className: badgeClassName } = config[source]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
        badgeClassName,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  )
}
