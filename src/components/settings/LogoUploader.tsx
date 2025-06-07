'use client'

import { FileUploader } from '../ui/FileUploader'

interface LogoUploaderProps {
  currentLogo?: {
    url: string
    width?: number
    height?: number
  } | null
  onLogoChange: (logo: { url: string; width: number; height: number } | null) => void
  className?: string
}

export function LogoUploader({
  currentLogo,
  onLogoChange,
  className = ''
}: LogoUploaderProps) {
  return (
    <FileUploader
      currentFile={currentLogo}
      onFileChange={onLogoChange}
      accept="image/*"
      maxSize={2 * 1024 * 1024} // 2MB
      previewSize={{ width: 200, height: 100 }}
      className={className}
    />
  )
}
