<template>
  <UModal v-model="isModalOpen" :prevent-close="loading">
    <UCard
      :ui="{
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            {{ title }}
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            :disabled="loading"
            @click="handleCancel"
          />
        </div>
      </template>

      <div class="py-4">
        <div class="flex items-start gap-4">
          <!-- Ícone de alerta -->
          <div class="flex-shrink-0">
            <ExclamationTriangleIcon
              class="h-6 w-6 text-red-600 dark:text-red-400"
              aria-hidden="true"
            />
          </div>

          <!-- Mensagem -->
          <div class="flex-1">
            <p class="text-sm text-gray-700 dark:text-gray-300">
              {{ message }}
            </p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <UButton color="gray" variant="outline" :disabled="loading" @click="handleCancel">
            {{ cancelText }}
          </UButton>

          <UButton color="red" :loading="loading" :disabled="loading" @click="handleConfirm">
            {{ confirmText }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'

interface Props {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

interface Emits {
  confirm: []
  cancel: []
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  loading: false,
})

const emit = defineEmits<Emits>()

// Controlar abertura do modal
const isModalOpen = computed({
  get: () => props.isOpen,
  set: (value: boolean) => {
    if (!value) {
      emit('cancel')
    }
  },
})

// Manipuladores de eventos
const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
/* Estilos customizados se necessário */
</style>
