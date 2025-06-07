import { useMemo } from 'react';
import zxcvbn from 'zxcvbn';

export interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
}

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string;
  requirements: {
    id: string;
    label: string;
    valid: boolean;
  }[];
}

const defaultRequirements: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'Pelo menos 8 caracteres',
    validator: (password: string) => password.length >= 8,
  },
  {
    id: 'lowercase',
    label: 'Uma letra minúscula',
    validator: (password: string) => /[a-z]/.test(password),
  },
  {
    id: 'uppercase',
    label: 'Uma letra maiúscula',
    validator: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: 'number',
    label: 'Um número',
    validator: (password: string) => /\d/.test(password),
  },
  {
    id: 'special',
    label: 'Um caractere especial',
    validator: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

const getFeedback = (score: number): string => {
  switch (score) {
    case 0:
      return 'Senha muito fraca';
    case 1:
      return 'Senha fraca';
    case 2:
      return 'Senha razoável';
    case 3:
      return 'Senha forte';
    case 4:
      return 'Senha muito forte';
    default:
      return '';
  }
};

export const usePasswordStrength = (
  password: string,
  customRequirements: PasswordRequirement[] = []
): PasswordStrength => {
  return useMemo(() => {
    // Combinar requisitos padrão com customizados
    const requirements = [...defaultRequirements, ...customRequirements];

    // Validar requisitos
    const validatedRequirements = requirements.map((req) => ({
      id: req.id,
      label: req.label,
      valid: req.validator(password),
    }));

    // Calcular força da senha com zxcvbn
    const result = zxcvbn(password);

    // Ajustar score baseado nos requisitos
    const allRequirementsMet = validatedRequirements.every((req) => req.valid);
    const adjustedScore = allRequirementsMet ? result.score : Math.min(result.score, 2);

    return {
      score: adjustedScore,
      feedback: getFeedback(adjustedScore),
      requirements: validatedRequirements,
    };
  }, [password, customRequirements]);
};
