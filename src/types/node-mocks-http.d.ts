declare module 'node-mocks-http' {
  import { NextRequest } from 'next/server'
  
  export interface RequestOptions {
    method?: string
    url?: string
    query?: Record<string, any>
    params?: Record<string, any>
    body?: any
    headers?: Record<string, string>
  }

  export interface MockResponse {
    _getJSONData(): any
    statusCode: number
  }

  export interface RequestResponse {
    req: NextRequest
    res: MockResponse
  }

  export function createMocks(options?: RequestOptions): RequestResponse
}
