import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  score: number;
  feedback: string;
  requirements: {
    id: string;
    label: string;
    valid: boolean;
  }[];
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  score,
  feedback,
  requirements,
}) => {
  // Cores baseadas no score
  const getScoreColor = (barScore: number) => {
    if (score >= barScore) {
      switch (score) {
        case 0:
          return 'bg-destructive/50';
        case 1:
          return 'bg-destructive';
        case 2:
          return 'bg-yellow-500';
        case 3:
          return 'bg-green-500';
        case 4:
          return 'bg-green-600';
        default:
          return 'bg-muted';
      }
    }
    return 'bg-muted';
  };

  const requirements_list = [
    { id: 'hasMinLength', label: 'Mínimo de 8 caracteres', valid: requirements.find(req => req.id === 'hasMinLength')?.valid ?? false },
    { id: 'hasUpperCase', label: 'Uma letra maiúscula', valid: requirements.find(req => req.id === 'hasUpperCase')?.valid ?? false },
    { id: 'hasLowerCase', label: 'Uma letra minúscula', valid: requirements.find(req => req.id === 'hasLowerCase')?.valid ?? false },
    { id: 'hasNumber', label: 'Um número', valid: requirements.find(req => req.id === 'hasNumber')?.valid ?? false },
    { id: 'hasSpecialChar', label: 'Um caractere especial', valid: requirements.find(req => req.id === 'hasSpecialChar')?.valid ?? false }
  ];

  return (
    <div className="mt-2 space-y-3">
      {/* Barras de progresso */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((barScore) => (
          <div
            key={barScore}
            className={cn(
              'h-2 w-full rounded-full transition-colors',
              getScoreColor(barScore)
            )}
          />
        ))}
      </div>

      {/* Feedback */}
      <p className={cn(
        'text-sm transition-colors',
        score <= 1 ? 'text-destructive' :
        score === 2 ? 'text-yellow-500' :
        score >= 3 ? 'text-green-500' :
        'text-muted-foreground'
      )}>
        {feedback}
      </p>

      {/* Lista de requisitos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        {requirements_list.map((requirement) => (
          <div key={requirement.id} className="flex items-center gap-2">
            {requirement.valid ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-destructive" />
            )}
            <span className={cn(
              'text-muted-foreground',
              requirement.valid && 'text-green-500'
            )}>
              {requirement.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
