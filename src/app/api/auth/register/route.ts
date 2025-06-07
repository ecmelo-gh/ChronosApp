import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

import { successResponse, errorResponse } from '@/lib/api/responses'
import { validateRequest, withErrorHandler } from '@/lib/api/middleware'
import { registerSchema } from '@/schemas/auth'

const handler = async (req: NextRequest) => {
  const data = await req.json()

  // Check if user already exists
  const existingUser = await prisma.users.findUnique({
    where: { email: data.email }
  })

  if (existingUser) {
    return errorResponse(
      'BAD_REQUEST',
      'Email is already registered',
      undefined,
      409
    )
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(data.password, 10)

  try {
    // Create user with default settings
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        password: hashedPassword,
        encrypted_password: hashedPassword, // For compatibility
        raw_user_meta_data: {},
        requiresVerification: false
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true
      }
    })

    return successResponse({
      user,
      message: 'Account created successfully. Please sign in.'
    }, 201)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return errorResponse('BAD_REQUEST', 'Email is already registered', undefined, 409)
      }
    }
    throw error // Will be caught by withErrorHandler
  }
}

// Exportar handler com middlewares
export const POST = withErrorHandler(
  validateRequest(registerSchema, handler)
)
