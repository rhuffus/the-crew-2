import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient, ApiRequestError } from '@/lib/api-client'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('apiClient', () => {
  it('should GET and parse JSON', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: '1' }) })
    const result = await apiClient.get('/test')
    expect(result).toEqual({ id: '1' })
    expect(mockFetch).toHaveBeenCalledWith('/api/test')
  })

  it('should POST with JSON body', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: '1' }) })
    await apiClient.post('/test', { name: 'foo' })
    expect(mockFetch).toHaveBeenCalledWith('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"name":"foo"}',
    })
  })

  it('should PATCH with JSON body', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: '1' }) })
    await apiClient.patch('/test', { name: 'bar' })
    expect(mockFetch).toHaveBeenCalledWith('/api/test', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: '{"name":"bar"}',
    })
  })

  it('should PUT with JSON body', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: '1' }) })
    await apiClient.put('/test', { name: 'baz' })
    expect(mockFetch).toHaveBeenCalledWith('/api/test', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: '{"name":"baz"}',
    })
  })

  it('should throw ApiRequestError on non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ code: 'NOT_FOUND', message: 'Not found' }),
    })
    await expect(apiClient.get('/missing')).rejects.toThrow(ApiRequestError)
  })

  it('should handle non-JSON error responses', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('not json')),
    })
    const error = await apiClient.get('/fail').catch((e) => e) as ApiRequestError
    expect(error).toBeInstanceOf(ApiRequestError)
    expect(error.status).toBe(500)
    expect(error.error.message).toBe('Internal Server Error')
  })
})
