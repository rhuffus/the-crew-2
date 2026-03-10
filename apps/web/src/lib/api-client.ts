import type { ApiError } from '@the-crew/shared-types'

const BASE_URL = '/api'

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly error: ApiError,
  ) {
    super(error.message)
    this.name = 'ApiRequestError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      code: 'UNKNOWN',
      message: response.statusText,
    }))
    throw new ApiRequestError(response.status, error)
  }
  return response.json() as Promise<T>
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return fetch(`${BASE_URL}${path}`).then(handleResponse<T>)
  },

  post<T>(path: string, body: unknown): Promise<T> {
    return fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse<T>)
  },

  patch<T>(path: string, body: unknown): Promise<T> {
    return fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse<T>)
  },

  put<T>(path: string, body: unknown): Promise<T> {
    return fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse<T>)
  },

  delete<T = void>(path: string): Promise<T> {
    return fetch(`${BASE_URL}${path}`, { method: 'DELETE' }).then((res) => {
      if (!res.ok) {
        return handleResponse<T>(res)
      }
      return undefined as T
    })
  },
}
