import React from 'react'
import { useForm, FormProvider, SubmitHandler, UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { styled } from '@stitches/react'

const StyledForm = styled('form', {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  width: '100%',
})

interface FormProps<T extends z.ZodType<any, any>> {
  schema: T
  onSubmit: SubmitHandler<z.infer<T>>
  children: React.ReactNode
  options?: Omit<UseFormProps<z.infer<T>>, 'resolver'>
  className?: string
}

export function Form<T extends z.ZodType<any, any>>({
  schema,
  onSubmit,
  children,
  options,
  className,
}: FormProps<T>) {
  const methods = useForm({
    ...options,
    resolver: zodResolver(schema),
  })

  return (
    <FormProvider {...methods}>
      <StyledForm
        onSubmit={methods.handleSubmit(onSubmit)}
        className={className}
        noValidate
      >
        {children}
      </StyledForm>
    </FormProvider>
  )
}
