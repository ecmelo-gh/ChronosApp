import { prisma } from './prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

type AuditAction = 'create' | 'update' | 'delete'
type AuditResource = 'customer' | 'appointment' | 'service' | 'customer_feedback' | 'establishment'

interface AuditLog {
  action: AuditAction
  resource: AuditResource
  resourceId: string
  userId: string
  details?: any
}

export async function createAuditLog({
  action,
  resource,
  resourceId,
  userId,
  details
}: AuditLog) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    await prisma.auditLog.create({
      data: {
        action,
        resource,
        resourceId,
        userId: session.user.id,
        details,
      },
    })
  } catch (error) {
    console.error('Error creating audit log:', error)
  }
}
