import { NextRequest } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'

import { successResponse } from '@/lib/api/responses'
import { validateRequest, withErrorHandler, withAuth } from '@/lib/api/middleware'
import { imageValidationSchema } from '@/schemas/upload.schema'

const postHandler = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const formData = await req.formData()
  const file = formData.get('file') as File

  // Criar nome único para o arquivo
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const fileName = `${params.id}-${Date.now()}.${file.type.split('/')[1]}`

  // Salvar arquivo no diretório público
  const path = join(process.cwd(), 'public/uploads', fileName)
  await writeFile(path, buffer)

  // Atualizar URL da foto no banco
  const photoUrl = `/uploads/${fileName}`
  await prisma.customer.update({
    where: { id: params.id },
    data: { photoUrl },
  })

  return successResponse({
    message: 'Foto atualizada com sucesso',
    data: { url: photoUrl }
  })
}

export const POST = withErrorHandler(
  withAuth(
    validateRequest(imageValidationSchema, postHandler)
  )
)
