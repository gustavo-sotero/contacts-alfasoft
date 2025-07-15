import type { CreateContactData, UpdateContactData } from '@/services/contacts'
import { useContactsStore } from '@/stores/contacts'
import type { Contact } from '@/types'
import { storeToRefs } from 'pinia'

export function useContacts() {
  // Usar o store Pinia
  const store = useContactsStore()

  // Extrair estado reativo do store
  const { contacts, loading, error, hasContacts, contactsCount } = storeToRefs(store)

  // Buscar todos os contatos
  const fetchContacts = async () => {
    await store.fetchContacts()
  }

  // Buscar contato por ID
  const fetchContact = async (id: number): Promise<Contact | null> => {
    return await store.fetchContact(id)
  }

  // Criar novo contato
  const createContact = async (data: CreateContactData): Promise<boolean> => {
    try {
      await store.createContact(data)
      return true
    } catch {
      return false
    }
  }

  // Atualizar contato
  const updateContact = async (id: number, data: UpdateContactData): Promise<boolean> => {
    try {
      await store.updateContact(id, data)
      return true
    } catch {
      return false
    }
  }

  // Deletar contato
  const deleteContact = async (id: number): Promise<boolean> => {
    try {
      await store.deleteContact(id)
      return true
    } catch {
      return false
    }
  }

  // Buscar contato por ID do estado (sem fazer requisição)
  const getContactById = (id: number): Contact | undefined => {
    return store.getContactById(id)
  }

  // Limpar erros
  const clearError = () => {
    store.clearError()
  }

  return {
    // Estado
    contacts,
    loading,
    error,

    // Computados
    hasContacts,
    contactsCount,

    // Métodos
    fetchContacts,
    fetchContact,
    getContactById,
    createContact,
    updateContact,
    deleteContact,
    clearError,
  }
}
