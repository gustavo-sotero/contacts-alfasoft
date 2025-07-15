import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { config } from 'dotenv'
import Fastify, { FastifyInstance } from 'fastify'
import path from 'path'
import { fileURLToPath } from 'url'
import contactRoutes from './routes/contacts.js'

// Load test environment variables
config({ path: '.env.test' })

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Build the app for testing
export const build = async (opts = {}): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: false, // Disable logging in tests
    ...opts,
  })

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
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })

  await app.register(fastifyMultipart, {
    limits: {
      fieldNameSize: 100,
      fieldSize: 100,
      fields: 10,
      fileSize: 5242880, // 5MB
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

  // Health check endpoint
  app.get('/api/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'test',
  }))

  // Register contact routes
  await app.register(contactRoutes)

  return app
}
