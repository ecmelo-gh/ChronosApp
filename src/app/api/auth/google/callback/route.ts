import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error('Missing required environment variables for Google OAuth')
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
)

export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.redirect('/login?error=unauthorized')
    }

    const url = new URL(request.url)
    const code = url.searchParams.get('code')

    if (!code) {
      return NextResponse.redirect('/customers?error=no_code')
    }

    // Trocar o código por tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Inicializar o serviço de contatos
    const people = google.people({ version: 'v1', auth: oauth2Client })

    // Buscar contatos
    const { data } = await people.people.connections.list({
      personFields: ['names', 'emailAddresses', 'phoneNumbers', 'photos'],
      resourceName: 'people/me',
    })

    const connections = data.connections || []

    // Processar e salvar contatos
    for (const person of connections) {
      const name = person.names?.[0]?.displayName
      const email = person.emailAddresses?.[0]?.value
      const phone = person.phoneNumbers?.[0]?.value
      const imageUrl = person.photos?.[0]?.url

      if (name && (email || phone)) {
        let customer = email 
          ? await prisma.customer.findFirst({ where: { email } })
          : null

        if (!customer) {
          // Cria um novo customer
          customer = await prisma.customer.create({
            data: {
              full_name: name,
              email: email || null,
              phone: phone || null,
              imageUrl: imageUrl || null,
              userId: session.user.id,
              status: 'active'
            }
          })
        }
      }
    }

    return NextResponse.redirect('/customers?success=imported')
  } catch (error) {
    console.error('Error importing contacts:', error)
    return NextResponse.redirect('/customers?error=import_failed')
  }
}
