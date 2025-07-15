import { FastifyInstance } from 'fastify'
import FormData from 'form-data'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { build } from '../test-helper.js'

describe('Sistema de Upload de Imagens', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await build()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /api/contacts - Criar contato com imagem', () => {
    it('deve criar contato com upload de imagem válida', async () => {
      // Criar uma imagem de teste simples (1x1 pixel PNG)
      const testImageBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
        0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f,
        0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0b, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00,
        0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
      ])

      const form = new FormData()
      form.append('name', 'João da Silva')
      form.append('contact', '123456789')
      form.append('email', 'joao@teste.com')
      form.append('picture', testImageBuffer, {
        filename: 'test.png',
        contentType: 'image/png',
      })

      const response = await app.inject({
        method: 'POST',
        url: '/api/contacts',
        payload: form,
        headers: form.getHeaders(),
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toHaveProperty('id')
      expect(body.data.picture).toMatch(/^\/uploads\/images\/\d+_.+\.png$/)
    })

    it('deve falhar com tipo de arquivo inválido', async () => {
      const form = new FormData()
      form.append('name', 'Maria Santos')
      form.append('contact', '987654321')
      form.append('email', 'maria@teste.com')
      form.append('picture', 'conteúdo de texto', {
        filename: 'test.txt',
        contentType: 'text/plain',
      })

      const response = await app.inject({
        method: 'POST',
        url: '/api/contacts',
        payload: form,
        headers: form.getHeaders(),
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.error).toBe('Erro no upload da imagem')
      expect(body.message).toContain('Tipo de arquivo não permitido')
    })

    it('deve falhar sem imagem', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/contacts',
        payload: {
          name: 'Pedro Oliveira',
          contact: '111222333',
          email: 'pedro@teste.com',
        },
        headers: {
          'content-type': 'application/json',
        },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.error).toBe('Imagem obrigatória')
    })
  })

  describe('PUT /api/contacts/:id - Atualizar contato com imagem', () => {
    let contactId: number

    beforeAll(async () => {
      // Criar um contato para testes de atualização
      const testImageBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
        0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f,
        0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0b, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00,
        0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
      ])

      const form = new FormData()
      form.append('name', 'Teste Upload')
      form.append('contact', '999888777')
      form.append('email', 'teste@upload.com')
      form.append('picture', testImageBuffer, {
        filename: 'test.png',
        contentType: 'image/png',
      })

      const response = await app.inject({
        method: 'POST',
        url: '/api/contacts',
        payload: form,
        headers: form.getHeaders(),
      })

      const body = JSON.parse(response.body)
      contactId = body.data.id
    })

    it('deve atualizar contato com nova imagem', async () => {
      const newImageBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
        0x52, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x08, 0x06, 0x00, 0x00, 0x00, 0x72,
        0xb6, 0x0d, 0x24, 0x00, 0x00, 0x00, 0x16, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00,
        0x02, 0x96, 0x60, 0x00, 0x02, 0x96, 0x60, 0x00, 0x00, 0x00, 0x15, 0x00, 0x03, 0x5b, 0xd6,
        0x22, 0x19, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
      ])

      const form = new FormData()
      form.append('name', 'Teste Upload Atualizado')
      form.append('picture', newImageBuffer, {
        filename: 'new-test.png',
        contentType: 'image/png',
      })

      const response = await app.inject({
        method: 'PUT',
        url: `/api/contacts/${contactId}`,
        payload: form,
        headers: form.getHeaders(),
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.name).toBe('Teste Upload Atualizado')
      expect(body.data.picture).toMatch(/^\/uploads\/images\/\d+_.+\.png$/)
    })

    it('deve atualizar contato sem alterar imagem', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/api/contacts/${contactId}`,
        payload: {
          name: 'Nome Atualizado Apenas',
        },
        headers: {
          'content-type': 'application/json',
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.name).toBe('Nome Atualizado Apenas')
      expect(body.data.picture).toMatch(/^\/uploads\/images\/\d+_.+\.png$/) // Imagem mantida
    })
  })

  describe('Validações de Upload', () => {
    it('deve validar extensões permitidas', async () => {
      const form = new FormData()
      form.append('name', 'Teste Extensão')
      form.append('contact', '555444333')
      form.append('email', 'extensao@teste.com')
      form.append('picture', 'conteúdo', {
        filename: 'test.bmp',
        contentType: 'image/bmp',
      })

      const response = await app.inject({
        method: 'POST',
        url: '/api/contacts',
        payload: form,
        headers: form.getHeaders(),
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.message).toContain('Extensão de arquivo não permitida')
    })

    it('deve validar tipos MIME permitidos', async () => {
      const form = new FormData()
      form.append('name', 'Teste MIME')
      form.append('contact', '777888999')
      form.append('email', 'mime@teste.com')
      form.append('picture', 'conteúdo', {
        filename: 'test.png',
        contentType: 'application/octet-stream',
      })

      const response = await app.inject({
        method: 'POST',
        url: '/api/contacts',
        payload: form,
        headers: form.getHeaders(),
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.message).toContain('Tipo de arquivo não permitido')
    })
  })

  describe('Endpoint estático de uploads', () => {
    let imagePath: string

    beforeAll(async () => {
      // Criar contato com imagem para testar endpoint estático
      const testImageBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
        0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f,
        0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0b, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00,
        0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
      ])

      const form = new FormData()
      form.append('name', 'Teste Estático')
      form.append('contact', '123123123')
      form.append('email', 'estatico@teste.com')
      form.append('picture', testImageBuffer, {
        filename: 'static-test.png',
        contentType: 'image/png',
      })

      const response = await app.inject({
        method: 'POST',
        url: '/api/contacts',
        payload: form,
        headers: form.getHeaders(),
      })

      const body = JSON.parse(response.body)
      imagePath = body.data.picture
    })

    it('deve servir imagem via endpoint estático', async () => {
      const response = await app.inject({
        method: 'GET',
        url: imagePath,
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toContain('image/')
    })

    it('deve retornar 404 para imagem inexistente', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/uploads/images/inexistente.png',
      })

      expect(response.statusCode).toBe(404)
    })
  })
})
