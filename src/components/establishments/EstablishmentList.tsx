'use client'

import { EstablishmentStatus } from '@prisma/client'
import { EstablishmentResponse } from '@/types/establishment'
import Link from 'next/link'

interface EstablishmentListProps {
  establishments: EstablishmentResponse[]
  onStatusChange?: (id: string, status: EstablishmentStatus) => Promise<void>
}

export function EstablishmentList({ establishments, onStatusChange }: EstablishmentListProps) {
  const getStatusColor = (status: EstablishmentStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {establishments.map((establishment) => (
          <li key={establishment.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <div className="flex items-center">
                    <p className="truncate text-sm font-medium text-indigo-600">
                      {establishment.name}
                    </p>
                    <span
                      className={`ml-2 inline-flex rounded-full px-2 text-xs font-semibold ${getStatusColor(
                        establishment.status
                      )}`}
                    >
                      {establishment.status}
                    </span>
                  </div>
                  <div className="mt-2 flex">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="truncate">{establishment.address}</span>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex flex-shrink-0 space-x-4">
                  {onStatusChange && establishment.status !== 'ACTIVE' && (
                    <button
                      onClick={() => onStatusChange(establishment.id, 'ACTIVE')}
                      className="inline-flex items-center rounded px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                    >
                      Ativar
                    </button>
                  )}
                  {onStatusChange && establishment.status !== 'SUSPENDED' && (
                    <button
                      onClick={() => onStatusChange(establishment.id, 'SUSPENDED')}
                      className="inline-flex items-center rounded px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                    >
                      Suspender
                    </button>
                  )}
                  <Link
                    href={`/establishment/${establishment.id}`}
                    className="inline-flex items-center rounded px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                  >
                    Gerenciar
                  </Link>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
