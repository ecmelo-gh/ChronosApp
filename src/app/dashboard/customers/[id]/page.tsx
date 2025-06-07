import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { CustomerHeader } from "@/components/customers/CustomerHeader"
import { CustomerDetails } from "@/components/customers/CustomerDetails"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"

interface CustomerPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params,
}: CustomerPageProps): Promise<Metadata> {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    select: { full_name: true },
  })

  if (!customer) {
    return {
      title: "Cliente não encontrado",
    }
  }

  return {
    title: `${customer.full_name} | Cliente`,
  }
}

export default async function CustomerPage({ params }: CustomerPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    notFound()
  }

  const customer = await prisma.customer.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      appointments: {
        orderBy: {
          date: 'desc'
        },
        take: 5,
        include: {
          service: true
        }
      }
    }
  })

  if (!customer) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <CustomerHeader 
        customer={customer}
      />
      
      <CustomerDetails 
        customer={customer}
      />
    </div>
  )
}
