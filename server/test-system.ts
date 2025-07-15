import { healthCheck, testConnection } from './database/connection.js'
import { ContactModel } from './models/Contact.js'

async function testSystem() {
  console.log('🧪 Iniciando teste completo do sistema...\n')

  try {
    // Testar conexão com banco
    console.log('=== TESTE DE CONEXÃO COM BANCO ===')
    const isConnected = await testConnection()

    if (!isConnected) {
      console.error('❌ Falha na conexão com o banco de dados')
      return
    }

    // Testar health check
    console.log('\n=== TESTE DE HEALTH CHECK ===')
    const health = await healthCheck()
    console.log('🏥 Health check result:', health)

    console.log('\n=== TESTE DO MODELO CONTACT ===')

    // Testar criação de contato
    console.log('📝 Testando criação de contato...')
    const newContact = await ContactModel.create({
      name: 'João Silva Teste',
      contact: '123456789',
      email: 'joao.teste@email.com',
      picture: 'https://example.com/joao.jpg',
    })
    console.log('✅ Contato criado:', newContact)

    // Testar busca por ID
    console.log('\n🔍 Testando busca por ID...')
    const foundContact = await ContactModel.findById(newContact.id!)
    console.log('✅ Contato encontrado:', foundContact)

    // Testar listagem
    console.log('\n📋 Testando listagem de contatos...')
    const allContacts = await ContactModel.findAll()
    console.log(`✅ Total de contatos encontrados: ${allContacts.length}`)

    // Testar busca por nome
    console.log('\n🔍 Testando busca por nome...')
    const searchResults = await ContactModel.searchByName('João')
    console.log(`✅ Contatos encontrados na busca: ${searchResults.length}`)

    // Testar atualização
    console.log('\n✏️ Testando atualização de contato...')
    const updatedContact = await ContactModel.update(newContact.id!, {
      name: 'João Silva Atualizado',
    })
    console.log('✅ Contato atualizado:', updatedContact)

    // Testar exclusão
    console.log('\n🗑️ Testando exclusão de contato...')
    await ContactModel.delete(newContact.id!)
    console.log('✅ Contato excluído com sucesso')

    // Verificar se foi realmente excluído
    try {
      await ContactModel.findById(newContact.id!)
      console.log('❌ Erro: contato ainda existe após exclusão')
    } catch {
      console.log('✅ Confirmado: contato foi excluído')
    }

    console.log('\n🎉 Todos os testes do sistema passaram com sucesso!')
  } catch (error) {
    console.error('❌ Erro durante teste do sistema:', error)
    console.error('Stack trace:', error.stack)
  }
}

// Executar teste se arquivo foi chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testSystem()
    .then(() => {
      console.log('\n🔚 Teste finalizado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error)
      process.exit(1)
    })
}

export { testSystem }
