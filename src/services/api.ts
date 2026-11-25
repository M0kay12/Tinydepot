// All calls to the TinyDepot backend live here.
// In dev, requests go to /api/v1 and Vite forwards them to the backend (see vite.config.ts),
// so the login cookies work without CORS problems.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

export type ApiUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  role?: string
}

export type ApiCategory = {
  id: string
  name: string
  description?: string | null
}

export type ApiSubCategory = {
  id: string
  name: string
  description?: string | null
  categoryId: string
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retried = false
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include', // the backend keeps the login in HTTP-only cookies
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  })

  // Access token expired: ask for a new one once, then retry.
  if (response.status === 401 && !retried && !path.startsWith('/auth/')) {
    const refresh = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    })
    if (refresh.ok) return request<T>(path, options, true)
  }

  const text = await response.text()
  let data: any = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`)
  }
  return data as T
}

// Some backends wrap results, e.g. { data: [...] } or { user: {...} }.
const asList = <T,>(data: any): T[] =>
  Array.isArray(data) ? data : data?.data ?? data?.items ?? []

export const api = {
  // Auth
  register: (body: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (email: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  me: async (): Promise<ApiUser> => {
    const data = await request<any>('/auth/me')
    return data?.user ?? data
  },

  // Categories
  getCategories: async () =>
    asList<ApiCategory>(await request('/categories')),

  addCategory: (name: string, description?: string) =>
    request('/categories', {
      method: 'POST',
      body: JSON.stringify({ name, description })
    }),

  deleteCategory: (id: string) =>
    request(`/categories/${id}`, { method: 'DELETE' }),

  // Subcategories
  getSubCategories: async () =>
    asList<ApiSubCategory>(await request('/subCategories')),

  addSubCategory: (categoryId: string, name: string, description?: string) =>
    request(`/categories/${categoryId}/subCategories`, {
      method: 'POST',
      body: JSON.stringify({ name, description })
    }),

  deleteSubCategory: (id: string) =>
    request(`/subCategories/${id}`, { method: 'DELETE' })
}
