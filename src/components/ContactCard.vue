<template>
  <UCard
    class="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
    @click="$emit('view-details', contact)"
  >
    <template #header>
      <div class="flex items-center gap-4">
        <UAvatar :src="contact.picture" :alt="contact.name" size="lg" class="flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {{ contact.name }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">ID: {{ contact.id }}</p>
        </div>
      </div>
    </template>

    <div class="space-y-3">
      <!-- Informações de contato -->
      <div class="flex items-center gap-2">
        <PhoneIcon class="h-4 w-4 text-gray-400 flex-shrink-0" />
        <span class="text-sm text-gray-700 dark:text-gray-300">
          {{ formatPhone(contact.contact) }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <EnvelopeIcon class="h-4 w-4 text-gray-400 flex-shrink-0" />
        <span class="text-sm text-gray-700 dark:text-gray-300 truncate">
          {{ contact.email }}
        </span>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-wrap gap-2 justify-end">
        <UButton
          icon="i-heroicons-eye"
          size="sm"
          color="blue"
          variant="ghost"
          @click.stop="$emit('view-details', contact)"
          class="flex-shrink-0 min-w-0"
        >
          <span class="hidden sm:inline">Ver</span>
          <span class="sm:hidden">Ver</span>
        </UButton>
        <UButton
          icon="i-heroicons-pencil"
          size="sm"
          color="gray"
          variant="ghost"
          @click.stop="$emit('edit', contact)"
          class="flex-shrink-0 min-w-0"
        >
          <span class="hidden sm:inline">Editar</span>
          <span class="sm:hidden">Editar</span>
        </UButton>
        <UButton
          icon="i-heroicons-trash"
          size="sm"
          color="red"
          variant="ghost"
          @click.stop="$emit('delete', contact)"
          class="flex-shrink-0 min-w-0"
        >
          <span class="hidden sm:inline">Deletar</span>
          <span class="sm:hidden">Deletar</span>
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
