<script setup lang="ts">
import ContactForm from '@/components/ContactForm.vue'
import { useContacts } from '@/composables/useContacts'
import type { CreateContactData } from '@/services/contacts'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { createContact, loading, error, clearError } = useContacts()

// Estado local
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

// Submeter formulário
const handleSubmit = async (data: CreateContactData) => {
  try {
    isSubmitting.value = true
    submitError.value = null
    clearError()

    const success = await createContact(data)

    if (success) {
      // Navegar para a home após sucesso (ou para detalhes se tivéssemos o ID)
      router.push('/')
    } else {
      submitError.value = error.value || 'Erro ao criar contato'
    }
  } catch (err) {
    submitError.value = err instanceof Error ? err.message : 'Erro inesperado'
  } finally {
    isSubmitting.value = false
  }
}

// Cancelar e voltar para home
const handleCancel = () => {
  router.push('/')
}

// Limpar erro
const clearSubmitError = () => {
  submitError.value = null
  clearError()
}
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
          Voltar para lista
        </UButton>
      </div>

      <!-- Cabeçalho -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Adicionar Contato</h1>
        <p class="mt-2 text-sm text-gray-700">
          Preencha as informações abaixo para criar um novo contato
        </p>
      </div>

      <!-- Erro de submissão -->
      <div v-if="submitError || error" class="mb-6">
        <UAlert
          title="Erro ao criar contato"
          :description="submitError || error"
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
            mode="create"
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
                <li>A imagem é obrigatória e deve ser menor que 5MB</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
