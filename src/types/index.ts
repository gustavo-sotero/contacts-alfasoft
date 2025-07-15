// Tipos globais para a aplicação

export interface Contact {
  id?: number
  name: string
  contact: string
  email: string
  picture: string
}

export interface ApiError {
  message: string
  statusCode?: number
  details?: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
