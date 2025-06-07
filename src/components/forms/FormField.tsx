import React from 'react'
import { useFormContext } from 'react-hook-form'
import { styled } from '@stitches/react'

const FormGroup = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  width: '100%',
})

const Label = styled('label', {
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'var(--foreground)',
})

const Input = styled('input', {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--background)',
  color: 'var(--foreground)',
  fontSize: '0.875rem',
  transition: 'border-color 0.2s, box-shadow 0.2s',

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary)',
    boxShadow: '0 0 0 2px var(--primary-alpha)',
  },

  '&:disabled': {
    backgroundColor: 'var(--muted)',
    cursor: 'not-allowed',
  },

  '&[aria-invalid="true"]': {
    borderColor: 'var(--destructive)',
    '&:focus': {
      boxShadow: '0 0 0 2px var(--destructive-alpha)',
    },
  },
})

const ErrorMessage = styled('span', {
  fontSize: '0.75rem',
  color: 'var(--destructive)',
})

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  name: string
}

export function FormField({ label, name, type = 'text', ...props }: FormFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]?.message as string | undefined

  return (
    <FormGroup>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        aria-invalid={!!error}
        {...register(name)}
        {...props}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FormGroup>
  )
}
