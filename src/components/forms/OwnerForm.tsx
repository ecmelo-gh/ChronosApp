import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { PlanType } from '@prisma/client'
import { CreateOwnerDTO } from '@/types/owner'

const ownerSchema = z.object({
  businessName: z.string().min(3, 'Nome muito curto').max(100),
  document: z.string().min(14, 'CNPJ inválido').max(18).optional(),
  phone: z.string().min(10, 'Telefone inválido').max(15).optional(),
  plan: z.nativeEnum(PlanType).optional()
})

type OwnerFormData = z.infer<typeof ownerSchema>

interface OwnerFormProps {
  onSubmit: (data: CreateOwnerDTO) => Promise<void>
  isLoading?: boolean
}

export function OwnerForm({ onSubmit, isLoading }: OwnerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<OwnerFormData>({
    resolver: zodResolver(ownerSchema)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
          Nome da Empresa
        </label>
        <input
          type="text"
          id="businessName"
          {...register('businessName')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.businessName && (
          <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="document" className="block text-sm font-medium text-gray-700">
          CNPJ
        </label>
        <input
          type="text"
          id="document"
          {...register('document')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.document && (
          <p className="mt-1 text-sm text-red-600">{errors.document.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Telefone
        </label>
        <input
          type="tel"
          id="phone"
          {...register('phone')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
          Plano
        </label>
        <select
          id="plan"
          {...register('plan')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="BASIC">Básico (1 estabelecimento)</option>
          <option value="PREMIUM">Premium (até 3 estabelecimentos)</option>
          <option value="ENTERPRISE">Enterprise (ilimitado)</option>
        </select>
        {errors.plan && (
          <p className="mt-1 text-sm text-red-600">{errors.plan.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? 'Cadastrando...' : 'Cadastrar'}
      </button>
    </form>
  )
}
