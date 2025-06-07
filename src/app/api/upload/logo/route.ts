import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const filename = `logo-${timestamp}${file.name.substring(file.name.lastIndexOf('.'))}`
    
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    try {
      await writeFile(join(uploadDir, '.keep'), '')
    } catch (error) {
      console.error('Error creating uploads directory:', error)
    }
    
    // Save to public directory
    const path = join(uploadDir, filename)
    await writeFile(path, buffer)

    // Return the public URL
    return NextResponse.json({ 
      url: `/uploads/${filename}`,
      message: 'Logo uploaded successfully' 
    })
  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    )
  }
}
