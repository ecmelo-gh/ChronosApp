import React from 'react'
import { styled } from '@stitches/react'
import { Form } from './Form'
import { FormField } from './FormField'
import { Button } from './Button'
import { customerSchema, type CustomerFormData } from '@/lib/validations/schemas'
import { Grid } from '../layout/Grid'

const FormActions = styled('div', {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '1rem',
  marginTop: '1rem',
})

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void | Promise<void>
  defaultValues?: Partial<CustomerFormData>
  isSubmitting?: boolean
}

export function CustomerForm({ 
  onSubmit, 
  defaultValues,
  isSubmitting,
}: CustomerFormProps) {
  return (
    <Form
      schema={customerSchema}
      onSubmit={onSubmit}
      options={{ defaultValues }}
    >
      <Grid cols={{ initial: 1, sm: 2 }} gap={4}>
        <FormField
          label="Nome completo"
          name="full_name"
          placeholder="Digite o nome completo"
          required
        />
        
        <FormField
          label="Telefone"
          name="phone"
          placeholder="Digite o telefone (XX9XXXXXXXX)"
          required
        />
        
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="Digite o email"
        />
        
        <FormField
          label="CPF"
          name="cpf"
          placeholder="Digite o CPF (XXX.XXX.XXX-XX)"
        />
        
        <FormField
          label="Data de nascimento"
          name="birthDate"
          type="date"
        />
      </Grid>

      <FormActions>
        <Button
          type="button"
          variant="outline"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isSubmitting}
        >
          Salvar
        </Button>
      </FormActions>
    </Form>
  )
}
