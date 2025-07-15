<script setup lang="ts">
import ContactForm from '@/components/ContactForm.vue'
import { useContacts } from '@/composables/useContacts'
import type { CreateContactData } from '@/services/contacts'
import type { Contact } from '@/types'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const { fetchContact, updateContact, loading, error, clearError } = useContacts()

// Estado local
const contact = ref<Contact | null>(null)
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const isLoadingContact = ref(false)

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

  try {
    isLoadingContact.value = true
    clearError()

    const contactData = await fetchContact(contactId.value)
    if (contactData) {
      contact.value = contactData
    } else {
      // Se contato não foi encontrado, redirecionar para home
      router.push('/')
    }
  } finally {
    isLoadingContact.value = false
  }
}

// Submeter formulário
const handleSubmit = async (data: CreateContactData) => {
  if (!contact.value?.id) return

  try {
    isSubmitting.value = true
    submitError.value = null
    clearError()

    const success = await updateContact(contact.value.id, data)

    if (success) {
      // Navegar para detalhes do contato após sucesso
      router.push(`/contacts/${contact.value.id}`)
    } else {
      submitError.value = error.value || 'Erro ao atualizar contato'
    }
  } catch (err) {
    submitError.value = err instanceof Error ? err.message : 'Erro inesperado'
  } finally {
    isSubmitting.value = false
  }
}

// Cancelar e voltar para detalhes
const handleCancel = () => {
  if (contact.value?.id) {
    router.push(`/contacts/${contact.value.id}`)
  } else {
    router.push('/')
  }
}

// Limpar erro
const clearSubmitError = () => {
  submitError.value = null
  clearError()
}

// Carregar contato ao montar
onMounted(() => {
  loadContact()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Navegação -->
      <div class="mb-6">
        <UButton
          @click="handleCancel"
          icon="i-heroicons-arrow-left"
          variant="ghost"
          color="zinc"
          size="sm"
          class="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        >
          {{ contact ? 'Voltar para detalhes' : 'Voltar para lista' }}
        </UButton>
      </div>

      <!-- Estado de Loading do contato -->
      <div v-if="isLoadingContact" class="flex justify-center items-center py-20">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"
          ></div>
          <p class="mt-4 text-sm text-gray-700">Carregando dados do contato...</p>
        </div>
      </div>

      <!-- Estado de Erro ao carregar -->
      <div v-else-if="error && !contact" class="py-12">
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

      <!-- Formulário de edição -->
      <div v-else-if="contact">
        <!-- Cabeçalho -->
        <div class="mb-8">
          <div class="flex items-center gap-4 mb-4">
            <UAvatar :src="contact.picture" :alt="contact.name" size="lg" />
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Editar Contato</h1>
              <p class="text-sm text-gray-700">{{ contact.name }} - ID: {{ contact.id }}</p>
            </div>
          </div>
          <p class="text-sm text-gray-700">Altere as informações abaixo para atualizar o contato</p>
        </div>

        <!-- Erro de submissão -->
        <div v-if="submitError" class="mb-6">
          <UAlert
            title="Erro ao atualizar contato"
            :description="submitError"
            color="red"
            variant="soft"
            :close-button="{
              icon: 'i-heroicons-x-mark-20-solid',
              color: 'gray',
              variant: 'link',
              padded: false,
            }"
            @close="clearSubmitError"
          />
        </div>

        <!-- Formulário -->
        <div class="bg-white shadow-sm rounded-lg border border-gray-200">
          <div class="px-6 py-8">
            <ContactForm
              mode="edit"
              :contact="contact"
              :loading="isSubmitting || loading"
              @submit="handleSubmit"
              @cancel="handleCancel"
            />
          </div>
        </div>

        <!-- Informações adicionais -->
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">Informações importantes</h3>
              <div class="mt-2 text-sm text-blue-700">
                <ul class="list-disc pl-5 space-y-1">
                  <li>O nome deve ter pelo menos 5 caracteres</li>
                  <li>O telefone deve ter exatamente 9 dígitos</li>
                  <li>O email deve ter um formato válido</li>
                  <li>A imagem é opcional - se não selecionar uma nova, a atual será mantida</li>
                  <li>Novas imagens devem ser menores que 5MB</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
