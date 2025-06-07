export interface UploadResult {
  id: string
  url: string
  fileName: string
  fileType: string
  fileSize: number
  path: string
  metadata?: {
    thumbnails?: {
      small: string
      medium: string
      large: string
    }
  }
}
