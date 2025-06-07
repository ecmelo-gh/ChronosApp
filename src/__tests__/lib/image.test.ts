import { processImage, optimizeImage, generateThumbnails, THUMBNAIL_SIZES } from '@/lib/image'
import sharp from 'sharp'
import { join } from 'path'

describe('Image Processing', () => {
  let testImageBuffer: Buffer

  beforeAll(async () => {
    // Criar uma imagem de teste usando sharp
    testImageBuffer = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .jpeg()
    .toBuffer()
  })

  describe('processImage', () => {
    it('should process image with default options', async () => {
      const processed = await processImage(testImageBuffer)
      
      expect(processed.buffer).toBeInstanceOf(Buffer)
      expect(processed.format).toBe('webp')
      expect(processed.info.format).toBe('webp')
    })

    it('should resize image when dimensions are provided', async () => {
      const processed = await processImage(testImageBuffer, {
        width: 300,
        height: 300
      })

      expect(processed.info.width).toBe(300)
      expect(processed.info.height).toBe(300)
    })

    it('should convert image format', async () => {
      const processed = await processImage(testImageBuffer, {
        format: 'png'
      })

      expect(processed.format).toBe('png')
      expect(processed.info.format).toBe('png')
    })
  })

  describe('optimizeImage', () => {
    it('should optimize image maintaining quality', async () => {
      const original = await sharp(testImageBuffer).metadata()
      const optimized = await optimizeImage(testImageBuffer)

      expect(optimized.buffer.length).toBeLessThan(testImageBuffer.length)
      expect(optimized.info.width).toBe(original.width)
      expect(optimized.info.height).toBe(original.height)
    })

    it('should optimize image with custom quality', async () => {
      const optimized = await optimizeImage(testImageBuffer, {
        quality: 50
      })

      expect(optimized.buffer.length).toBeLessThan(testImageBuffer.length)
    })
  })

  describe('generateThumbnails', () => {
    it('should generate thumbnails in all sizes', async () => {
      const thumbnails = await generateThumbnails(testImageBuffer, 'test.jpg')

      for (const [size, dimensions] of Object.entries(THUMBNAIL_SIZES)) {
        expect(thumbnails[size as keyof typeof THUMBNAIL_SIZES]).toMatch(new RegExp(`^/uploads/.*_${size}\\.webp$`))
        
        const metadata = await sharp(join(process.cwd(), 'public', thumbnails[size as keyof typeof THUMBNAIL_SIZES].substring(1)))
          .metadata()

        expect(metadata.width).toBe(dimensions.width)
        expect(metadata.height).toBe(dimensions.height)
      }
    })
  })
})
