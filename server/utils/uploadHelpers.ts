import { MultipartFile } from '@fastify/multipart'
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'fs'
import { dirname, extname, join } from 'path'
import { pipeline } from 'stream/promises'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Tipos MIME permitidos para imagens
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

// Extensões permitidas
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

// Tamanho máximo de arquivo (5MB) - usado para validação futura
// const MAX_FILE_SIZE = 5 * 1024 * 1024

export interface UploadResult {
  success: boolean
  filePath?: string
  fileName?: string
  error?: string
}

/**
 * Valida se o arquivo de imagem é válido
 */
export function validateImageFile(file: MultipartFile): { valid: boolean; error?: string } {
  // Verificar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Tipos aceitos: ${ALLOWED_MIME_TYPES.join(', ')}`,
    }
  }

  // Verificar extensão do arquivo
  const fileExtension = extname(file.filename || '').toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return {
      valid: false,
      error: `Extensão de arquivo não permitida. Extensões aceitas: ${ALLOWED_EXTENSIONS.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Gera um nome único para o arquivo
 */
export function generateUniqueFileName(originalName: string): string {
  const extension = extname(originalName).toLowerCase()
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  return `${timestamp}_${randomString}${extension}`
}

/**
 * Garante que o diretório de upload existe
 */
export function ensureUploadDirectory(): string {
  const uploadDir = join(__dirname, '..', 'uploads', 'images')

  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true })
  }

  return uploadDir
}

/**
 * Salva um arquivo de imagem no diretório de uploads
 */
export async function saveImageFile(file: MultipartFile): Promise<UploadResult> {
  try {
    // Validar arquivo
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      }
    }

    // Garantir que o diretório existe
    const uploadDir = ensureUploadDirectory()

    // Gerar nome único
    const uniqueFileName = generateUniqueFileName(file.filename || 'image.jpg')
    const filePath = join(uploadDir, uniqueFileName)

    // Salvar arquivo
    const writeStream = createWriteStream(filePath)
    await pipeline(file.file, writeStream)

    // Retornar caminho relativo para salvar no banco
    const relativePath = `/uploads/images/${uniqueFileName}`

    return {
      success: true,
      filePath: relativePath,
      fileName: uniqueFileName,
    }
  } catch (error) {
    return {
      success: false,
      error: `Erro ao salvar arquivo: ${error.message}`,
    }
  }
}

/**
 * Remove um arquivo de imagem
 */
export function deleteImageFile(filePath: string): boolean {
  try {
    if (!filePath || !filePath.startsWith('/uploads/images/')) {
      return false
    }

    const fullPath = join(
      __dirname,
      '..',
      'uploads',
      'images',
      filePath.replace('/uploads/images/', ''),
    )

    if (existsSync(fullPath)) {
      unlinkSync(fullPath)
      return true
    }

    return false
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error)
    return false
  }
}

/**
 * Processa upload de imagem do request body (usado com attachFieldsToBody: true)
 */
export async function processContactData(body: Record<string, unknown>): Promise<{
  imageResult?: UploadResult
  contactData: { name: string; contact: string; email: string; picture?: string }
}> {
  let imageResult: UploadResult | undefined
  const contactData: Record<string, string> = {}

  // Processar campos do body
  for (const [key, value] of Object.entries(body)) {
    if (key === 'picture' && value && typeof value === 'object' && 'file' in value) {
      // É um arquivo
      imageResult = await saveImageFile(value as MultipartFile)
    } else {
      // É um campo de texto
      const fieldValue =
        typeof value === 'object' && value !== null && 'value' in value
          ? (value as { value: string }).value
          : (value as string)
      contactData[key] = fieldValue || ''
    }
  }

  return {
    imageResult,
    contactData: {
      name: contactData.name || '',
      contact: contactData.contact || '',
      email: contactData.email || '',
      picture: contactData.picture,
    },
  }
}
