import type { Contact } from '@/types'
import api from './api'

// Tipos específicos para requisições
export interface CreateContactData {
  name: string
  contact: string
  email: string
  picture: File | string
}

export type UpdateContactData = Partial<CreateContactData>

// Serviços da API de contatos
export const contactsService = {
  // Listar todos os contatos
  async getAll(): Promise<Contact[]> {
    const response = await api.get('/contacts')
    return response.data
  },

  // Buscar contato por ID
  async getById(id: number): Promise<Contact> {
    const response = await api.get(`/contacts/${id}`)
    return response.data
  },

  // Criar novo contato
  async create(data: CreateContactData): Promise<Contact> {
    const formData = new FormData()

    formData.append('name', data.name)
    formData.append('contact', data.contact)
    formData.append('email', data.email)

    if (data.picture instanceof File) {
      formData.append('picture', data.picture)
    }

    const response = await api.post('/contacts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Atualizar contato existente
  async update(id: number, data: UpdateContactData): Promise<Contact> {
    const formData = new FormData()

    if (data.name) formData.append('name', data.name)
    if (data.contact) formData.append('contact', data.contact)
    if (data.email) formData.append('email', data.email)

    if (data.picture instanceof File) {
      formData.append('picture', data.picture)
    }

    const response = await api.put(`/contacts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Deletar contato
  async delete(id: number): Promise<void> {
    await api.delete(`/contacts/${id}`)
  },
}

export default contactsService
