import { FastifyInstance } from 'fastify'
import { ContactModel } from '../models/Contact.js'
import { deleteImageFile, processContactData } from '../utils/uploadHelpers.js'

// Tipos para os parâmetros das rotas
interface ContactParams {
  id: string
}

interface ContactQuery {
  search?: string
  limit?: number
  offset?: number
}

export default async function contactRoutes(fastify: FastifyInstance) {
  // GET /api/contacts - Listar todos os contatos
  fastify.get<{ Querystring: ContactQuery }>('/api/contacts', async (request, reply) => {
    try {
      const { search, limit, offset } = request.query

      let contacts
      if (search) {
        contacts = await ContactModel.searchByName(search)
      } else {
        contacts = await ContactModel.findAll()
      }

      // Aplicar paginação se especificada
      if (limit !== undefined && offset !== undefined) {
        const start = offset
        const end = start + limit
        contacts = contacts.slice(start, end)
      }

      return {
        success: true,
        data: contacts,
        total: contacts.length,
        message: 'Contatos listados com sucesso',
      }
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message,
      })
    }
  })

  // GET /api/contacts/:id - Buscar contato por ID
  fastify.get<{ Params: ContactParams }>('/api/contacts/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const contactId = parseInt(id)

      if (isNaN(contactId)) {
        return reply.status(400).send({
          success: false,
          error: 'ID inválido',
          message: 'ID deve ser um número válido',
        })
      }

      const contact = await ContactModel.findById(contactId)
      return {
        success: true,
        data: contact,
        message: 'Contato encontrado com sucesso',
      }
    } catch (error) {
      request.log.error(error)

      if (error.message.includes('não encontrado')) {
        return reply.status(404).send({
          success: false,
          error: 'Contato não encontrado',
          message: error.message,
        })
      }

      return reply.status(500).send({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message,
      })
    }
  })

  // POST /api/contacts - Criar novo contato
  fastify.post('/api/contacts', async (request, reply) => {
    try {
      // Processar dados do contato e upload de imagem
      const { imageResult, contactData } = await processContactData(
        request.body as Record<string, unknown>,
      )

      // Verificar se houve erro no upload da imagem
      if (imageResult && !imageResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Erro no upload da imagem',
          message: imageResult.error,
        })
      }

      // Incluir caminho da imagem nos dados do contato se upload foi bem-sucedido
      if (imageResult?.success && imageResult.filePath) {
        contactData.picture = imageResult.filePath
      } else if (!contactData.picture) {
        return reply.status(400).send({
          success: false,
          error: 'Imagem obrigatória',
          message: 'É necessário enviar uma imagem para o contato',
        })
      }

      // Verificar se picture está definido antes de criar o contato
      if (!contactData.picture) {
        return reply.status(400).send({
          success: false,
          error: 'Imagem obrigatória',
          message: 'É necessário enviar uma imagem para o contato',
        })
      }

      const contact = await ContactModel.create({
        name: contactData.name,
        contact: contactData.contact,
        email: contactData.email,
        picture: contactData.picture,
      })
      return reply.status(201).send({
        success: true,
        data: contact,
        message: 'Contato criado com sucesso',
      })
    } catch (error) {
      request.log.error(error)

      if (error.message.includes('validação') || error.message.includes('já existem')) {
        return reply.status(400).send({
          success: false,
          error: 'Dados inválidos',
          message: error.message,
        })
      }

      return reply.status(500).send({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message,
      })
    }
  })

  // PUT /api/contacts/:id - Atualizar contato
  fastify.put<{ Params: ContactParams }>('/api/contacts/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const contactId = parseInt(id)

      if (isNaN(contactId)) {
        return reply.status(400).send({
          success: false,
          error: 'ID inválido',
          message: 'ID deve ser um número válido',
        })
      }

      // Buscar contato existente para obter imagem atual
      const existingContact = await ContactModel.findById(contactId)

      // Processar dados do contato e upload de imagem
      const { imageResult, contactData } = await processContactData(
        request.body as Record<string, unknown>,
      )

      // Verificar se houve erro no upload da imagem
      if (imageResult && !imageResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Erro no upload da imagem',
          message: imageResult.error,
        })
      }

      // Processar imagem - nova ou manter existente
      if (imageResult?.success && imageResult.filePath) {
        // Nova imagem foi enviada - deletar a antiga se existir
        if (existingContact.picture) {
          deleteImageFile(existingContact.picture)
        }
        contactData.picture = imageResult.filePath
      } else if (!contactData.picture && existingContact.picture) {
        // Nenhuma nova imagem - manter a existente
        contactData.picture = existingContact.picture
      }

      // Filtrar campos vazios para update parcial
      const updateData: Partial<typeof contactData> = {}
      Object.entries(contactData).forEach(([key, value]) => {
        if (value !== '' && value !== undefined) {
          updateData[key as keyof typeof contactData] = value
        }
      })

      const contact = await ContactModel.update(contactId, updateData)
      return {
        success: true,
        data: contact,
        message: 'Contato atualizado com sucesso',
      }
    } catch (error) {
      request.log.error(error)

      if (error.message.includes('não encontrado')) {
        return reply.status(404).send({
          success: false,
          error: 'Contato não encontrado',
          message: error.message,
        })
      }

      if (error.message.includes('validação') || error.message.includes('já existem')) {
        return reply.status(400).send({
          success: false,
          error: 'Dados inválidos',
          message: error.message,
        })
      }

      return reply.status(500).send({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message,
      })
    }
  })

  // DELETE /api/contacts/:id - Deletar contato
  fastify.delete<{ Params: ContactParams }>('/api/contacts/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const contactId = parseInt(id)

      if (isNaN(contactId)) {
        return reply.status(400).send({
          success: false,
          error: 'ID inválido',
          message: 'ID deve ser um número válido',
        })
      }

      await ContactModel.delete(contactId)
      return reply.status(200).send({
        success: true,
        message: 'Contato deletado com sucesso',
      })
    } catch (error) {
      request.log.error(error)

      if (error.message.includes('não encontrado')) {
        return reply.status(404).send({
          success: false,
          error: 'Contato não encontrado',
          message: error.message,
        })
      }

      return reply.status(500).send({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message,
      })
    }
  })
}
