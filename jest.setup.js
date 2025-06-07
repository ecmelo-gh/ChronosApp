require('@testing-library/jest-dom')
const { TextEncoder, TextDecoder } = require('util')

// Mock web APIs
class MockFormData {}
class MockFile {}
class MockBlob {}

// Web APIs polyfills
global.FormData = MockFormData
global.File = MockFile
global.Blob = MockBlob
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock do fetch global
global.fetch = jest.fn()

// Mock do next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn()
}))

// Mock do next-auth/next
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}))

// Configurar variáveis de ambiente para testes de integração
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://your-project.supabase.co'
process.env.SUPABASE_SERVICE_KEY = 'your-service-key'
process.env.UPSTASH_REDIS_URL = 'https://your-redis.upstash.io'
process.env.UPSTASH_REDIS_TOKEN = 'your-redis-token'

// Limpar mocks antes de cada teste
beforeEach(() => {
  jest.clearAllMocks()
})
