import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { z } from 'zod'
import { db } from '../database/connection.js'

// Interfaces para tipos de retorno do MySQL2
interface ContactRow extends RowDataPacket {
  id: number
  name: string
  contact: string
  email: string
  picture: string
}

interface InsertResult extends ResultSetHeader {
  insertId: number
}

// Schema Zod para validação dos dados do contato
export const ContactSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(5, 'Nome deve ter pelo menos 5 caracteres'),
  contact: z.string().regex(/^\d{9}$/, 'Contato deve ter exatamente 9 dígitos'),
  email: z.string().email('Email deve ter formato válido'),
  picture: z.string().min(1, 'Imagem é obrigatória'),
})

// Schema para criação de contato (sem ID)
export const CreateContactSchema = ContactSchema.omit({ id: true })

// Schema para atualização de contato (todos os campos opcionais exceto ID)
export const UpdateContactSchema = z.object({
  name: z.string().min(5, 'Nome deve ter pelo menos 5 caracteres').optional(),
  contact: z
    .string()
    .regex(/^\d{9}$/, 'Contato deve ter exatamente 9 dígitos')
    .optional(),
  email: z.string().email('Email deve ter formato válido').optional(),
  picture: z.string().min(1, 'Imagem é obrigatória').optional(),
})

// Tipos TypeScript
export type Contact = z.infer<typeof ContactSchema>
export type CreateContact = z.infer<typeof CreateContactSchema>
export type UpdateContact = z.infer<typeof UpdateContactSchema>

// Classe modelo para operações CRUD
export class ContactModel {
  // Criar um novo contato
  static async create(contactData: CreateContact): Promise<Contact> {
    try {
      // Validar dados
      const validatedData = CreateContactSchema.parse(contactData)

      // Verificar se contact e email são únicos
      await this.checkUniqueness(validatedData.contact, validatedData.email)

      // Inserir no banco
      const [result] = await db.execute(
        'INSERT INTO contacts (name, contact, email, picture) VALUES (?, ?, ?, ?)',
        [validatedData.name, validatedData.contact, validatedData.email, validatedData.picture],
      )

      // Retornar o contato criado
      return await this.findById((result as InsertResult).insertId)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Erro de validação: ${error.errors.map((e) => e.message).join(', ')}`)
      }
      throw error
    }
  }

  // Listar todos os contatos
  static async findAll(): Promise<Contact[]> {
    try {
      const [rows] = await db.execute('SELECT * FROM contacts ORDER BY name')
      return (rows as ContactRow[]).map((contact) => ContactSchema.parse(contact))
    } catch (error) {
      throw new Error(`Erro ao buscar contatos: ${error}`)
    }
  }

  // Buscar contato por ID
  static async findById(id: number): Promise<Contact> {
    try {
      const [rows] = await db.execute('SELECT * FROM contacts WHERE id = ?', [id])
      const contacts = rows as ContactRow[]

      if (contacts.length === 0) {
        throw new Error('Contato não encontrado')
      }

      return ContactSchema.parse(contacts[0])
    } catch (error) {
      if (error.message === 'Contato não encontrado') {
        throw error
      }
      throw new Error(`Erro ao buscar contato: ${error}`)
    }
  }

  // Atualizar contato
  static async update(id: number, contactData: UpdateContact): Promise<Contact> {
    try {
      // Verificar se o contato existe
      await this.findById(id)

      // Validar dados
      const validatedData = UpdateContactSchema.parse(contactData)

      // Verificar uniqueness apenas dos campos que estão sendo atualizados
      if (validatedData.contact || validatedData.email) {
        await this.checkUniquenessForUpdate(id, validatedData.contact, validatedData.email)
      }

      // Construir query dinâmica
      const fields: string[] = []
      const values: (string | number)[] = []

      if (validatedData.name) {
        fields.push('name = ?')
        values.push(validatedData.name)
      }
      if (validatedData.contact) {
        fields.push('contact = ?')
        values.push(validatedData.contact)
      }
      if (validatedData.email) {
        fields.push('email = ?')
        values.push(validatedData.email)
      }
      if (validatedData.picture) {
        fields.push('picture = ?')
        values.push(validatedData.picture)
      }

      if (fields.length === 0) {
        throw new Error('Nenhum campo para atualizar')
      }

      values.push(id)

      await db.execute(`UPDATE contacts SET ${fields.join(', ')} WHERE id = ?`, values)

      // Retornar o contato atualizado
      return await this.findById(id)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Erro de validação: ${error.errors.map((e) => e.message).join(', ')}`)
      }
      throw error
    }
  }

  // Deletar contato
  static async delete(id: number): Promise<void> {
    try {
      // Verificar se o contato existe
      await this.findById(id)

      const [result] = await db.execute('DELETE FROM contacts WHERE id = ?', [id])

      if ((result as ResultSetHeader).affectedRows === 0) {
        throw new Error('Contato não encontrado')
      }
    } catch (error) {
      if (error.message === 'Contato não encontrado') {
        throw error
      }
      throw new Error(`Erro ao deletar contato: ${error}`)
    }
  }

  // Verificar se contact e email são únicos
  private static async checkUniqueness(contact: string, email: string): Promise<void> {
    const [rows] = await db.execute('SELECT id FROM contacts WHERE contact = ? OR email = ?', [
      contact,
      email,
    ])

    if ((rows as ContactRow[]).length > 0) {
      throw new Error('Contact ou email já existem')
    }
  }

  // Verificar uniqueness para atualização (excluir o próprio registro)
  private static async checkUniquenessForUpdate(
    id: number,
    contact?: string,
    email?: string,
  ): Promise<void> {
    if (!contact && !email) return

    const conditions: string[] = []
    const params: (string | number)[] = []

    if (contact) {
      conditions.push('contact = ?')
      params.push(contact)
    }

    if (email) {
      conditions.push('email = ?')
      params.push(email)
    }

    params.push(id)

    const [rows] = await db.execute(
      `SELECT id FROM contacts WHERE (${conditions.join(' OR ')}) AND id != ?`,
      params,
    )

    if ((rows as ContactRow[]).length > 0) {
      throw new Error('Contact ou email já existem')
    }
  }

  // Buscar contatos por nome (busca parcial)
  static async searchByName(name: string): Promise<Contact[]> {
    try {
      const [rows] = await db.execute('SELECT * FROM contacts WHERE name LIKE ? ORDER BY name', [
        `%${name}%`,
      ])
      return (rows as ContactRow[]).map((contact) => ContactSchema.parse(contact))
    } catch (error) {
      throw new Error(`Erro ao buscar contatos: ${error}`)
    }
  }
}
