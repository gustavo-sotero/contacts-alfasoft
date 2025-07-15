<script setup lang="ts">
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import { useContacts } from '@/composables/useContacts'
import type { Contact } from '@/types'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const { fetchContact, deleteContact, loading, error, clearError } = useContacts()

// Estado local
const contact = ref<Contact | null>(null)
const showDeleteModal = ref(false)
const isDeleting = ref(false)

// ID do contato da rota
const contactId = computed(() => {
  const id = route.params.id
  return Array.isArray(id) ? parseInt(id[0]) : parseInt(id as string)
})

// Carregar dados do contato
const loadContact = async () => {
  if (!contactId.value || isNaN(contactId.value)) {
    router.push('/')
    return
  }

  const contactData = await fetchContact(contactId.value)
  if (contactData) {
    contact.value = contactData
  } else {
    // Se contato não foi encontrado, redirecionar para home
    router.push('/')
  }
}

// Navegar para editar
const goToEdit = () => {
  router.push(`/edit/${contactId.value}`)
}

// Navegar de volta para home
const goToHome = () => {
  router.push('/')
}

// Confirmar delete
const confirmDelete = () => {
  showDeleteModal.value = true
}

// Executar delete
const handleDelete = async () => {
  if (!contact.value?.id) return

  isDeleting.value = true
  const success = await deleteContact(contact.value.id)

  if (success) {
    showDeleteModal.value = false
    router.push('/')
  } else {
    isDeleting.value = false
    // Modal permanece aberto para mostrar erro
  }
}

// Cancelar delete
const cancelDelete = () => {
  showDeleteModal.value = false
}

// Formatar telefone
const formatPhone = (phone: string): string => {
  if (phone.length !== 9) return phone
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.replace(/(\d{2})(\d{4})(\d{3})/, '($1) $2-$3')
}

// Carregar contato ao montar
onMounted(() => {
  loadContact()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Navegação -->
      <div class="mb-6">
        <UButton
          @click="goToHome"
          icon="i-heroicons-arrow-left"
          variant="ghost"
          color="zinc"
          class="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          size="sm"
        >
          Voltar para lista
        </UButton>
      </div>

      <!-- Estado de Loading -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"
          ></div>
          <p class="mt-4 text-sm text-gray-800">Carregando contato...</p>
        </div>
      </div>

      <!-- Estado de Erro -->
      <div v-else-if="error" class="py-12">
        <UAlert
          title="Erro ao carregar contato"
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
          <UButton @click="loadContact" variant="outline" icon="i-heroicons-arrow-path">
            Tentar Novamente
          </UButton>
        </div>
      </div>

      <!-- Detalhes do Contato -->
      <div v-else-if="contact" class="bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- Cabeçalho com foto e nome -->
        <div class="px-6 py-8 bg-gradient-to-r from-blue-500 to-blue-600">
          <div class="flex flex-col sm:flex-row sm:items-center gap-6">
            <div class="flex-shrink-0">
              <UAvatar
                :src="contact.picture"
                :alt="contact.name"
                size="3xl"
                class="ring-4 ring-white/20"
              />
            </div>
            <div class="text-white">
              <h1 class="text-3xl font-bold">{{ contact.name }}</h1>
              <p class="text-blue-100 mt-1">ID: {{ contact.id }}</p>
            </div>
          </div>
        </div>

        <!-- Informações de contato -->
        <div class="px-6 py-8">
          <div class="grid gap-6 md:grid-cols-2">
            <!-- Telefone -->
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                  <svg
                    class="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-900">Telefone</h3>
                <p class="text-lg text-gray-800 mt-1">{{ formatPhone(contact.contact) }}</p>
                <p class="text-xs text-gray-800 mt-1">Número de contato</p>
              </div>
            </div>

            <!-- Email -->
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                  <svg
                    class="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-900">Email</h3>
                <p class="text-lg text-gray-800 mt-1">{{ contact.email }}</p>
                <p class="text-xs text-gray-800 mt-1">Endereço de email</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Ações -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div class="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <UButton
              @click="goToEdit"
              icon="i-heroicons-pencil"
              color="blue"
              variant="solid"
              size="lg"
              class="w-full sm:w-auto justify-center sm:justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Editar Contato
            </UButton>
            <UButton
              @click="confirmDelete"
              icon="i-heroicons-trash"
              color="red"
              variant="outline"
              class="w-full sm:w-auto justify-center sm:justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              size="lg"
            >
              Deletar Contato
            </UButton>
          </div>
        </div>
      </div>

      <!-- Modal de Confirmação de Delete -->
      <ConfirmationModal
        :is-open="showDeleteModal"
        title="Deletar Contato"
        :message="
          contact
            ? `Tem certeza que deseja deletar ${contact.name}? Esta ação não pode ser desfeita.`
            : 'Tem certeza que deseja deletar este contato?'
        "
        confirm-text="Deletar"
        cancel-text="Cancelar"
        class="w-full sm:w-auto justify-center sm:justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        :loading="isDeleting"
        @confirm="handleDelete"
        @cancel="cancelDelete"
      />
    </div>
  </div>
</template>
