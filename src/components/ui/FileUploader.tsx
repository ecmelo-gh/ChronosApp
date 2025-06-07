'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface FileUploaderProps {
  currentFile?: {
    url: string
    width?: number
    height?: number
    name?: string
  } | null
  onFileChange: (file: { url: string; width: number; height: number; name: string } | null) => void
  accept?: string
  maxSize?: number // em bytes
  className?: string
  previewSize?: {
    width: number
    height: number
  }
}

export function FileUploader({
  currentFile,
  onFileChange,
  accept = 'image/*',
  maxSize = 2 * 1024 * 1024, // 2MB default
  className = '',
  previewSize = { width: 200, height: 100 }
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.target === dropZoneRef.current) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const validateFile = (file: File): string | null => {
    if (!file.type.match(accept.replace('*', '.*'))) {
      return `Formato inválido. Aceitos: ${accept}`
    }
    if (file.size > maxSize) {
      return `Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB`
    }
    return null
  }

  const handleFile = async (file: File) => {
    const error = validateFile(file)
    if (error) {
      setError(error)
      return
    }

    setError(undefined)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Erro ao fazer upload')
      }

      const data = await response.json()

      // Carregar imagem para obter dimensões
      const img = new Image()
      img.src = data.url

      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Calcular dimensões mantendo proporção
          const aspectRatio = img.width / img.height
          let width = previewSize.width
          let height = width / aspectRatio

          if (height > previewSize.height) {
            height = previewSize.height
            width = height * aspectRatio
          }

          onFileChange({
            url: data.url,
            width: Math.round(width),
            height: Math.round(height),
            name: file.name
          })
          resolve(null)
        }
        img.onerror = () => reject(new Error('Erro ao carregar imagem'))
      })
    } catch (error) {
      setError('Erro ao fazer upload. Tente novamente.')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
      setIsDragging(false)
    }
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      await handleFile(file)
    }
  }, [])

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleFile(file)
    }
  }

  const removeFile = () => {
    onFileChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setError(undefined)
  }

  return (
    <div className={className}>
      <div
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6
          flex flex-col items-center justify-center
          transition-all duration-200 ease-in-out
          ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        `}
      >
        <AnimatePresence mode="wait">
          {currentFile ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
            >
              <Image
                src={currentFile.url}
                alt={currentFile.name || 'Preview'}
                width={currentFile.width || previewSize.width}
                height={currentFile.height || previewSize.height}
                className="rounded object-contain"
              />
              <button
                onClick={removeFile}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full
                  hover:bg-red-600 transition-colors duration-200"
                title="Remover arquivo"
              >
                <X size={14} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {isUploading ? (
                <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
              ) : (
                <>
                  <div className="p-3 bg-gray-50 rounded-full mb-2">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 text-center mb-1">
                    Arraste um arquivo ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-400">
                    {accept.replace('image/*', 'Imagens')} até {maxSize / 1024 / 1024}MB
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          disabled={isUploading}
        />
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-red-500 mt-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
