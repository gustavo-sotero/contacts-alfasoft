<template>
  <div class="fixed top-4 right-4 z-50 space-y-2" style="z-index: 9999">
    <TransitionGroup
      enter-active-class="duration-300 ease-out"
      enter-from-class="transform opacity-0 translate-x-6"
      enter-to-class="transform opacity-100 translate-x-0"
      leave-active-class="duration-200 ease-in"
      leave-from-class="transform opacity-100 translate-x-0"
      leave-to-class="transform opacity-0 translate-x-6"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden',
          'transition-all duration-300 ease-in-out',
        ]"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <component
                :is="getIcon(notification.type)"
                :class="['h-6 w-6', getIconColor(notification.type)]"
              />
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p :class="['text-sm font-medium', getTitleColor(notification.type)]">
                {{ notification.title }}
              </p>
              <p v-if="notification.description" class="mt-1 text-sm text-gray-700">
                {{ notification.description }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="remove(notification.id)"
                class="bg-white rounded-md inline-flex text-gray-600 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span class="sr-only">Fechar</span>
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNotifications } from '@/composables/useNotifications'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

const { notifications, remove } = useNotifications()

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return CheckCircleIcon
    case 'error':
      return XCircleIcon
    case 'warning':
      return ExclamationTriangleIcon
    case 'info':
      return InformationCircleIcon
    default:
      return InformationCircleIcon
  }
}

const getIconColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-green-400'
    case 'error':
      return 'text-red-400'
    case 'warning':
      return 'text-yellow-400'
    case 'info':
      return 'text-blue-400'
    default:
      return 'text-gray-600'
  }
}

const getTitleColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-green-900'
    case 'error':
      return 'text-red-900'
    case 'warning':
      return 'text-yellow-900'
    case 'info':
      return 'text-blue-900'
    default:
      return 'text-gray-900'
  }
}
</script>

<style scoped>
/* Estilos adicionais se necessário */
</style>
