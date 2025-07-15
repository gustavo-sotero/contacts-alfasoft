import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyMultipart from '@fastify/multipart'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifyStatic from '@fastify/static'
import { config } from 'dotenv'
import Fastify, { FastifyError } from 'fastify'
import path from 'path'
import { fileURLToPath } from 'url'
import { ZodError } from 'zod'
import {
  createDatabaseIfNotExists,
  healthCheck,
  initializeDatabase,
  testConnection,
} from './database/connection.js'

// Load environment variables
config()

// Configure Fastify with enhanced logging
const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
})

const PORT = Number(process.env.PORT) || 3001
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Register security plugins
await app.register(fastifyHelmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'https:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
})

await app.register(fastifyCors, {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ]

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Not allowed by CORS'), false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
})

const timeWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW || '60000')
await app.register(fastifyRateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  timeWindow: timeWindowMs, // 1 minute
  skipOnError: true,
  errorResponseBuilder: (request, context) => {
    return {
      code: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded, retry in ${context.ttl} seconds. Max ${context.max} requests per ${Math.floor(timeWindowMs / 1000)} seconds.`,
    }
  },
})

await app.register(fastifyMultipart, {
  limits: {
    fieldNameSize: 100,
    fieldSize: 100,
    fields: 10,
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    files: 1,
    headerPairs: 2000,
    parts: 1000,
  },
  attachFieldsToBody: true,
})

// Serve uploads directory
await app.register(fastifyStatic, {
  root: path.join(__dirname, 'uploads'),
  prefix: '/uploads/',
  decorateReply: false,
})
// Configure error handler
app.setErrorHandler(async (error: FastifyError, request, reply) => {
  app.log.error(error)

  // Zod validation error
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: error.errors,
    })
  }

  // Rate limit error
  // Rate limit error
  if (error.statusCode === 429) {
    return reply.status(429).send({
      error: 'Too Many Requests',
      message: error.message,
    })
  }

  // Multipart error
  if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
    return reply.status(413).send({
      error: 'File Too Large',
      message: 'File size exceeds the maximum allowed limit',
    })
  }

  // Generic server error
  return reply.status(error.statusCode || 500).send({
    error: error.name || 'Internal Server Error',
    message: error.message || 'An unexpected error occurred',
  })
})

// Add request logging hooks
app.addHook('onRequest', async (request) => {
  app.log.info(`${request.method} ${request.url}`)
})

app.addHook('onResponse', async (request, reply) => {
  app.log.info(`${request.method} ${request.url} - ${reply.statusCode}`)
})

// Health check endpoint
app.get('/api/health', async () => {
  const dbHealth = await healthCheck()
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: dbHealth,
    version: process.env.npm_package_version || '1.0.0',
  }
})

// Import and register contact routes
import contactRoutes from './routes/contacts.js'
await app.register(contactRoutes)

// Rota de API de exemplo
app.get('/api/hello', async () => ({
  msg: 'Servidor Fastify configurado com sucesso!',
  timestamp: new Date().toISOString(),
}))

// Em produção: servir o Vue compilado
// Detecta se está rodando do dist/ ou diretamente
const isCompiledVersion = __dirname.includes('dist')
const htmlPath = isCompiledVersion
  ? path.join(__dirname, '../../html') // server/dist/ -> html/
  : path.join(__dirname, '../html') // server/ -> html/

await app.register(fastifyStatic, {
  root: htmlPath,
  prefix: '/',
  decorateReply: true,
})

// SPA fallback: qualquer rota não-API devolve index.html
app.setNotFoundHandler((req, reply) => {
  if (req.raw.url && req.raw.url.startsWith('/api/')) {
    reply.code(404).send({
      error: 'API endpoint not found',
      message: `The endpoint ${req.raw.url} does not exist`,
    })
  } else {
    reply.sendFile('index.html')
  }
})

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  app.log.info('Received SIGTERM, shutting down gracefully...')
  await app.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  app.log.info('Received SIGINT, shutting down gracefully...')
  await app.close()
  process.exit(0)
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

    app.log.info(`🚀 Servidor Fastify rodando na porta ${PORT}`)
    app.log.info(`📝 Health check disponível em: http://localhost:${PORT}/api/health`)
    app.log.info(`📁 Arquivos de upload em: http://localhost:${PORT}/uploads/`)
    app.log.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`)
    app.log.info(
      `🔒 Rate limit: ${process.env.RATE_LIMIT_MAX || '100'} requests per ${Math.floor(parseInt(process.env.RATE_LIMIT_WINDOW || '60000') / 1000)} seconds`,
    )
  } catch (error) {
    app.log.error('❌ Servidor falhou ao iniciar:', error)
    process.exit(1)
  }
}

start()

export default app
