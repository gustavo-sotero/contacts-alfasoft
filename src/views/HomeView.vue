<script setup lang="ts">
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import ContactCard from '@/components/ContactCard.vue'
import { useContacts } from '@/composables/useContacts'
import { useNotifications } from '@/composables/useNotifications'
import type { Contact } from '@/types'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { contacts, loading, error, hasContacts, fetchContacts, deleteContact, clearError } =
  useContacts()
const { success, error: showError } = useNotifications()

// Estado do modal de confirmação
const showDeleteModal = ref(false)
const contactToDelete = ref<Contact | null>(null)
const deletingContact = ref(false)

// Carregar contatos ao montar o componente
onMounted(() => {
  fetchContacts()
})

// Navegar para página de adicionar contato
const goToAddContact = () => {
  router.push('/add')
}

// Navegar para detalhes do contato
const goToContactDetails = (contact: Contact) => {
  router.push(`/contacts/${contact.id}`)
}

// Navegar para editar contato
const goToEditContact = (contact: Contact) => {
  router.push(`/edit/${contact.id}`)
}

// Abrir modal de confirmação para deletar contato
const confirmDeleteContact = (contact: Contact) => {
  contactToDelete.value = contact
  showDeleteModal.value = true
}

// Confirmar exclusão do contato
const handleDeleteConfirm = async () => {
  if (!contactToDelete.value?.id) return

  try {
    deletingContact.value = true
    const isSuccess = await deleteContact(contactToDelete.value.id)

    if (isSuccess) {
      showDeleteModal.value = false
      success('Contato deletado', 'O contato foi removido com sucesso.')
      contactToDelete.value = null
    } else {
      showError('Erro ao deletar', 'Não foi possível remover o contato.')
    }
  } catch (error) {
    console.error('Erro ao deletar contato:', error)
    showError('Erro inesperado', 'Ocorreu um erro inesperado ao deletar o contato.')
  } finally {
    deletingContact.value = false
  }
}

// Cancelar exclusão do contato
const handleDeleteCancel = () => {
  showDeleteModal.value = false
  contactToDelete.value = null
}
</script>

<template>
  <div class="min-h-screen min-w-screen bg-gray-50 py-4 sm:py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Cabeçalho -->
      <div class="mb-6 sm:mb-8">
        <div
          class="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Contatos</h1>
            <p class="mt-1 sm:mt-2 text-sm text-gray-700">
              Gerencie seus contatos de forma simples e organizada
            </p>
          </div>
          <div class="w-full sm:w-auto">
            <UButton
              @click="goToAddContact"
              icon="i-heroicons-plus"
              :size="{ xs: 'md', sm: 'lg' }"
              color="primary"
              variant="solid"
              class="w-full sm:w-auto justify-center"
            >
              <span class="sm:hidden">Adicionar</span>
              <span class="hidden sm:inline">Adicionar Contato</span>
            </UButton>
          </div>
        </div>
      </div>

      <!-- Estado de Loading -->
      <div v-if="loading" class="flex justify-center items-center py-8 sm:py-12">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-500 mx-auto"
          ></div>
          <p class="mt-4 text-sm text-gray-700">Carregando contatos...</p>
        </div>
      </div>

      <!-- Estado de Erro -->
      <div v-else-if="error" class="py-8 sm:py-12 px-4 sm:px-0">
        <UAlert
          :title="'Erro ao carregar contatos'"
          :description="error"
          color="red"
          variant="soft"
          :close-button="{
            icon: 'i-heroicons-x-mark-20-solid',
            color: 'gray',
            variant: 'link',
            padded: false,
          }"
          @close="clearError"
        />
        <div class="mt-4 text-center">
          <UButton
            @click="fetchContacts"
            variant="outline"
            icon="i-heroicons-arrow-path"
            :size="{ xs: 'md', sm: 'lg' }"
            class="w-full sm:w-auto"
          >
            Tentar Novamente
          </UButton>
        </div>
      </div>

      <!-- Lista de Contatos -->
      <div v-else-if="hasContacts">
        <div class="mb-4">
          <p class="text-sm text-gray-700">
            {{ contacts.length }}
            {{ contacts.length === 1 ? 'contato encontrado' : 'contatos encontrados' }}
          </p>
        </div>

        <!-- Grid responsivo de contatos -->
        <div
          class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        >
          <ContactCard
            v-for="contact in contacts"
            :key="contact.id"
            :contact="contact"
            @view-details="goToContactDetails"
            @edit="goToEditContact"
            @delete="confirmDeleteContact"
          />
        </div>
      </div>

      <!-- Estado Vazio -->
      <div v-else class="text-center py-8 sm:py-12">
        <div class="mx-auto h-16 w-16 sm:h-24 sm:w-24 text-gray-600">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 class="mt-4 text-base sm:text-lg font-medium text-gray-900">
          Nenhum contato encontrado
        </h3>
        <p class="mt-2 text-sm text-gray-700 px-4">
          Que tal começar adicionando seu primeiro contato?
        </p>
        <div class="mt-6 px-4">
          <UButton
            @click="goToAddContact"
            icon="i-heroicons-plus"
            :size="{ xs: 'md', sm: 'lg' }"
            color="primary"
            class="w-full sm:w-auto"
          >
            Adicionar Primeiro Contato
          </UButton>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação para Deletar Contato -->
    <ConfirmationModal
      v-if="showDeleteModal && contactToDelete"
      :is-open="showDeleteModal"
      :loading="deletingContact"
      title="Confirmar Exclusão"
      :message="`Tem certeza que deseja excluir o contato '${contactToDelete.name}'? Esta ação não pode ser desfeita.`"
      confirm-text="Excluir"
      cancel-text="Cancelar"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />
  </div>
</template>
