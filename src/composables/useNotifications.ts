import { ref, type Ref } from 'vue'

export interface Notification {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'warning' | 'info'
  timeout?: number
}

// Estado global das notificações
const notifications: Ref<Notification[]> = ref([])

export function useNotifications() {
  const add = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString()
    const newNotification = { ...notification, id }

    notifications.value.push(newNotification)

    // Auto-remover após timeout
    const timeout = notification.timeout || 4000
    setTimeout(() => {
      remove(id)
    }, timeout)

    return id
  }

  const remove = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clear = () => {
    notifications.value = []
  }

  const success = (title: string, description?: string) => {
    return add({
      title,
      description,
      type: 'success',
      timeout: 4000,
    })
  }

  const error = (title: string, description?: string) => {
    return add({
      title,
      description,
      type: 'error',
      timeout: 6000,
    })
  }

  const warning = (title: string, description?: string) => {
    return add({
      title,
      description,
      type: 'warning',
      timeout: 5000,
    })
  }

  const info = (title: string, description?: string) => {
    return add({
      title,
      description,
      type: 'info',
      timeout: 4000,
    })
  }

  return {
    notifications,
    success,
    error,
    warning,
    info,
    remove,
    clear,
  }
}
