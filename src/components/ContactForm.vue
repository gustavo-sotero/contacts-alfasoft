<template>
  <UForm ref="form" :validate="validate" :state="state" class="space-y-4" @submit="onSubmit">
    <!-- Nome -->
    <UFormGroup label="Nome" name="name" required>
      <UInput
        v-model="state.name"
        placeholder="Digite o nome completo (mínimo 5 caracteres)"
        icon="i-heroicons-user"
        :disabled="loading"
        maxlength="100"
      />
    </UFormGroup>

    <!-- Contato/Telefone -->
    <UFormGroup label="Telefone" name="contact" required>
      <UInput
        v-model="state.contact"
        placeholder="123456789 (exatamente 9 dígitos)"
        icon="i-heroicons-phone"
        :disabled="loading"
        maxlength="9"
        @input="formatContactInput"
      />
    </UFormGroup>

    <!-- Email -->
    <UFormGroup label="Email" name="email" required>
      <UInput
        v-model="state.email"
        type="email"
        placeholder="exemplo@email.com"
        icon="i-heroicons-envelope"
        :disabled="loading"
        maxlength="100"
      />
    </UFormGroup>

    <!-- Upload de Imagem -->
    <UFormGroup label="Foto" name="picture" required>
      <div class="space-y-3">
        <!-- Preview da imagem atual (modo edição) -->
        <div
          v-if="mode === 'edit' && currentImageUrl && !state.picture"
          class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <UAvatar :src="currentImageUrl" size="lg" />
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Imagem atual</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Selecione uma nova imagem para alterar
            </p>
          </div>
        </div>

        <!-- Preview da nova imagem -->
        <div
          v-if="imagePreview"
          class="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700"
        >
          <UAvatar :src="imagePreview" size="lg" />
          <div class="flex-1">
            <p class="text-sm font-medium text-green-900 dark:text-green-100">
              Nova imagem selecionada
            </p>
            <p class="text-xs text-green-600 dark:text-green-400">{{ state.picture?.name }}</p>
            <p class="text-xs text-green-600 dark:text-green-400">
              {{ formatFileSize(state.picture?.size || 0) }}
            </p>
          </div>
          <UButton
            color="red"
            variant="ghost"
            size="sm"
            icon="i-heroicons-x-mark"
            @click="clearImage"
          >
            Remover
          </UButton>
        </div>

        <!-- Erro de upload -->
        <div
          v-if="fileError"
          class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700"
        >
          <p class="text-sm text-red-600 dark:text-red-400">{{ fileError }}</p>
        </div>

        <!-- Input de arquivo -->
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif"
          class="hidden"
          @change="onFileSelect"
        />

        <div class="space-y-2">
          <UButton
            class="text-gray-500"
            variant="outline"
            icon="i-heroicons-photo"
            :disabled="loading"
            block
            @click="openFileSelector"
          >
            {{ state.picture ? 'Alterar Imagem' : 'Selecionar Imagem' }}
          </UButton>

          <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
            Formatos aceitos: JPG, PNG, GIF • Tamanho máximo: 5MB
          </p>
        </div>
      </div>
    </UFormGroup>

    <!-- Botões de ação -->
    <div class="flex flex-col sm:flex-row gap-3 pt-4">
      <UButton
        type="submit"
        :loading="loading"
        :disabled="loading || hasValidationErrors"
        class="flex-1 order-2 sm:order-1"
        size="lg"
      >
        {{ mode === 'create' ? 'Criar Contato' : 'Salvar Alterações' }}
      </UButton>

      <UButton
        color="zinc"
        variant="outline"
        :disabled="loading"
        class="flex-1 sm:flex-none order-1 sm:order-2 text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400"
        size="lg"
        @click="$emit('cancel')"
      >
        Cancelar
      </UButton>
    </div>
  </UForm>
</template>

<script setup lang="ts">
// Tipos básicos para o formulário (Nuxt UI)
interface FormError {
  path: string
  message: string
}

// Tipo para o estado do formulário
interface FormState {
  name: string
  contact: string
  email: string
  picture: File | null
}
import type { CreateContactData } from '@/services/contacts'
import type { Contact } from '@/types'
import { computed, onMounted, reactive, ref } from 'vue'

interface Props {
  contact?: Contact
  mode: 'create' | 'edit'
  loading?: boolean
}

interface Emits {
  submit: [data: CreateContactData]
  cancel: []
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

// Refs para elementos do DOM
const form = ref()
const fileInput = ref<HTMLInputElement>()

// Estado do formulário
const state = reactive<{
  name: string
  contact: string
  email: string
  picture: File | null
}>({
  name: '',
  contact: '',
  email: '',
  picture: null,
})

// Preview da imagem
const imagePreview = ref<string | null>(null)

// Erro de arquivo
const fileError = ref<string | null>(null)

// URL da imagem atual (modo edição)
const currentImageUrl = computed(() => props.contact?.picture || null)

// Verificar se há erros de validação
const hasValidationErrors = computed(() => {
  const errors = validate(state)
  return errors.length > 0
})

// Função para formatar tamanho do arquivo
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Validações do formulário
const validate = (state: FormState): FormError[] => {
  const errors: FormError[] = []

  // Validação do nome
  if (!state.name) {
    errors.push({ path: 'name', message: 'Nome é obrigatório' })
  } else if (state.name.length < 5) {
    errors.push({ path: 'name', message: 'Nome deve ter pelo menos 5 caracteres' })
  }

  // Validação do contato/telefone
  if (!state.contact) {
    errors.push({ path: 'contact', message: 'Telefone é obrigatório' })
  } else {
    const cleanContact = state.contact.replace(/\D/g, '')
    if (cleanContact.length !== 9) {
      errors.push({ path: 'contact', message: 'Telefone deve ter exatamente 9 dígitos' })
    }
  }

  // Validação do email
  if (!state.email) {
    errors.push({ path: 'email', message: 'Email é obrigatório' })
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(state.email)) {
      errors.push({ path: 'email', message: 'Email deve ter um formato válido' })
    }
  }

  // Validação da imagem
  if (props.mode === 'create' && !state.picture) {
    errors.push({ path: 'picture', message: 'Imagem é obrigatória' })
  }

  return errors
}

// Formatar entrada do telefone (remover caracteres não numéricos)
const formatContactInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '')

  // Limitar a 9 dígitos
  if (value.length <= 9) {
    state.contact = value
  }
}

// Abrir seletor de arquivo
const openFileSelector = () => {
  fileInput.value?.click()
}

// Manipular seleção de arquivo
const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  // Limpar erro anterior
  fileError.value = null

  if (file) {
    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      fileError.value = 'Formato de arquivo não suportado. Use JPG, PNG ou GIF.'
      target.value = ''
      return
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      fileError.value = 'Arquivo muito grande. O tamanho máximo é 5MB.'
      target.value = ''
      return
    }

    // Arquivo válido
    state.picture = file

    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// Limpar imagem selecionada
const clearImage = () => {
  state.picture = null
  imagePreview.value = null
  fileError.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Submeter formulário
const onSubmit = async () => {
  // Preparar dados para envio
  const submitData: CreateContactData = {
    name: state.name.trim(),
    contact: state.contact.replace(/\D/g, ''), // Garantir apenas dígitos
    email: state.email.trim().toLowerCase(),
    picture: state.picture || '', // Para edição sem nova imagem
  }

  emit('submit', submitData)
}

// Inicializar formulário com dados existentes (modo edição)
onMounted(() => {
  if (props.contact && props.mode === 'edit') {
    state.name = props.contact.name
    state.contact = props.contact.contact
    state.email = props.contact.email
    // picture permanece null para não sobrescrever a existente
  }
})
</script>

<style scoped>
/* Estilos customizados se necessário */
</style>
