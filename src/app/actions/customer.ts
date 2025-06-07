'use server'

import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function toggleCustomerStatus(customerId: string, currentStatus: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  
  try {
    const customer = await prisma.customer.update({
      where: { 
        id: customerId,
        userId: session.user.id
      },
      data: { status: newStatus }
    })

    await createAuditLog({
      action: 'update',
      resource: 'customer',
      resourceId: customer.id,
      userId: session.user.id,
      details: {
        status: {
          from: currentStatus,
          to: newStatus
        }
      }
    })

    revalidatePath('/dashboard/customers')
    revalidatePath(`/dashboard/customers/${customerId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error toggling customer status:', error)
    return { success: false }
  }
}
