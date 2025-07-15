<template>
  <UCard
    class="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full flex flex-col"
    @click="$emit('view-details', contact)"
  >
    <template #header>
      <div class="flex items-center gap-3 sm:gap-4 p-1">
        <UAvatar
          :src="contact.picture"
          :alt="contact.name"
          :size="{ xs: 'lg', sm: 'xl' }"
          class="flex-shrink-0"
        />
        <div class="flex-1 min-w-0">
          <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
            {{ contact.name }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: {{ contact.id }}</p>
        </div>
      </div>
    </template>

    <div class="flex-1 space-y-4 py-2">
      <!-- Informações de contato -->
      <div class="flex items-center gap-3">
        <PhoneIcon class="h-5 w-5 text-gray-400 flex-shrink-0" />
        <span class="text-sm text-gray-700 dark:text-gray-300 font-medium">
          {{ formatPhone(contact.contact) }}
        </span>
      </div>

      <div class="flex items-center gap-3">
        <EnvelopeIcon class="h-5 w-5 text-gray-400 flex-shrink-0" />
        <span class="text-sm text-gray-700 dark:text-gray-300 truncate">
          {{ contact.email }}
        </span>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col gap-2 pt-2">
        <div class="flex gap-2">
          <UButton
            icon="i-heroicons-eye"
            size="sm"
            color="blue"
            variant="ghost"
            @click.stop="$emit('view-details', contact)"
            class="flex-1 justify-center text-gray-700 hover:text-blue-700 hover:bg-blue-50"
          >
            Ver
          </UButton>
          <UButton
            icon="i-heroicons-pencil"
            size="sm"
            color="zinc"
            variant="ghost"
            @click.stop="$emit('edit', contact)"
            class="flex-1 justify-center text-gray-700 hover:text-zinc-700 hover:bg-zinc-50"
          >
            Editar
          </UButton>
        </div>
        <UButton
          icon="i-heroicons-trash"
          size="sm"
          color="red"
          variant="ghost"
          @click.stop="$emit('delete', contact)"
          class="w-full justify-center text-gray-700 hover:text-red-700 hover:bg-red-50"
        >
          Deletar
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { Contact } from '@/types'
import { EnvelopeIcon, PhoneIcon } from '@heroicons/vue/24/outline'

interface Props {
  contact: Contact
}

interface Emits {
  'view-details': [contact: Contact]
  edit: [contact: Contact]
  delete: [contact: Contact]
}

defineProps<Props>()
defineEmits<Emits>()

/**
 * Formata o número de telefone para exibição
 * Converte 123456789 para (12) 3456-7890
 */
const formatPhone = (phone: string): string => {
  if (phone.length !== 9) return phone

  const cleaned = phone.replace(/\D/g, '')
  const formatted = cleaned.replace(/(\d{2})(\d{4})(\d{3})/, '($1) $2-$3')
  return formatted
}
</script>

<style scoped>
/* Estilos customizados se necessário */
</style>
