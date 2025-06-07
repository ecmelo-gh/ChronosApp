'use client'

import { useState } from 'react'
import Image from 'next/image'

interface LogoUploadProps {
  currentLogo?: string
  onUpload?: (file: File) => Promise<void>
}

export function LogoUpload({ currentLogo, onUpload }: LogoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState(currentLogo)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Preview the image
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload the file
    if (onUpload) {
      try {
        setIsUploading(true)
        await onUpload(file)
      } catch (error) {
        console.error('Error uploading logo:', error)
        // Reset preview if upload fails
        setPreviewUrl(currentLogo)
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Company Logo"
            fill
            className="object-contain"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      <label className="relative cursor-pointer">
        <input
          type="file"
          className="sr-only"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <div className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50">
          {isUploading ? 'Uploading...' : 'Upload Logo'}
        </div>
      </label>
    </div>
  )
}
