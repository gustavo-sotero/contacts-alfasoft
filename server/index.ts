import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { config } from 'dotenv'
import Fastify from 'fastify'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  createDatabaseIfNotExists,
  healthCheck,
  initializeDatabase,
  testConnection,
} from './database/connection.js'

// Load environment variables
config()

const app = Fastify({ logger: true })
const PORT = Number(process.env.PORT) || 3000
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Register plugins
await app.register(fastifyHelmet, {
  contentSecurityPolicy: false, // Disable CSP for development
})

await app.register(fastifyCors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
})

await app.register(fastifyMultipart, {
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  },
})

// Serve uploads directory
await app.register(fastifyStatic, {
  root: path.join(__dirname, 'uploads'),
  prefix: '/uploads/',
})

// Health check endpoint
app.get('/api/health', async () => {
  return await healthCheck()
})

// API routes will be registered here
// TODO: Register contact routes

// Rota de API de exemplo
app.get('/api/hello', async () => ({ msg: 'Olá do Fastify!' }))

// Em produção: servir o Vue compilado
await app.register(fastifyStatic, {
  root: path.join(__dirname, '../html'),
  prefix: '/',
  decorateReply: false,
})

// SPA fallback: qualquer rota não‑API devolve index.html
app.setNotFoundHandler((req, reply) => {
  if (req.raw.url && req.raw.url.startsWith('/api/')) {
    reply.code(404).send({ error: 'API endpoint not found' })
  } else {
    reply.sendFile('index.html')
  }
})

// Initialize database and start server
async function start() {
  try {
    // Create database if it doesn't exist
    await createDatabaseIfNotExists()

    // Test database connection
    await testConnection()

    // Initialize database schema
    await initializeDatabase()

    // Start server
    await app.listen({ port: PORT, host: '0.0.0.0' })
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  } catch (error) {
    console.error('❌ Server failed to start:', error)
    process.exit(1)
  }
}

start()
