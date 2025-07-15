import {
  contactsService,
  type CreateContactData,
  type UpdateContactData,
} from '@/services/contacts'
import type { Contact } from '@/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useContactsStore = defineStore('contacts', () => {
  // Estado
  const contacts = ref<Contact[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters computados
  const hasContacts = computed(() => contacts.value.length > 0)
  const contactsCount = computed(() => contacts.value.length)

  // Getter para buscar contato por ID do estado local
  const getContactById = computed(() => {
    return (id: number) => contacts.value.find((contact) => contact.id === id)
  })

  // Actions
  const fetchContacts = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await contactsService.getAll()
      contacts.value = response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar contatos'
      console.error('Erro ao buscar contatos:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchContact = async (id: number): Promise<Contact | null> => {
    try {
      loading.value = true
      error.value = null
      const contact = await contactsService.getById(id)

      // Atualizar o contato no estado se já existir
      const index = contacts.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        contacts.value[index] = contact
      }

      return contact
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar contato'
      console.error('Erro ao buscar contato:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const createContact = async (data: CreateContactData): Promise<Contact | null> => {
    try {
      loading.value = true
      error.value = null
      const newContact = await contactsService.create(data)
      contacts.value.push(newContact)
      return newContact
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar contato'
      console.error('Erro ao criar contato:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateContact = async (id: number, data: UpdateContactData): Promise<Contact | null> => {
    try {
      loading.value = true
      error.value = null
      const updatedContact = await contactsService.update(id, data)

      // Atualizar o contato no estado
      const index = contacts.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        contacts.value[index] = updatedContact
      }

      return updatedContact
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar contato'
      console.error('Erro ao atualizar contato:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteContact = async (id: number): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      await contactsService.delete(id)

      // Remover contato do estado
      contacts.value = contacts.value.filter((c) => c.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao deletar contato'
      console.error('Erro ao deletar contato:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Ações utilitárias
  const clearError = () => {
    error.value = null
  }

  const clearContacts = () => {
    contacts.value = []
  }

  return {
    // Estado
    contacts,
    loading,
    error,

    // Getters
    hasContacts,
    contactsCount,
    getContactById,

    // Actions
    fetchContacts,
    fetchContact,
    createContact,
    updateContact,
    deleteContact,
    clearError,
    clearContacts,
  }
})
