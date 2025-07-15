import { config } from 'dotenv'
import mysql from 'mysql2/promise'

config()

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'contacts_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
}

// Create connection pool
export const db = mysql.createPool(dbConfig)

// Test connection
export async function testConnection() {
  try {
    const connection = await db.getConnection()
    console.log('✅ Database connected successfully')

    // Test with a simple query
    await connection.execute('SELECT 1 as test')
    console.log('✅ Database query test successful')

    connection.release()
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Health check function
export async function healthCheck() {
  try {
    const connection = await db.getConnection()
    await connection.execute('SELECT 1 as health')
    connection.release()
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
    }
  }
}

// Initialize database with schema
export async function initializeDatabase() {
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const { fileURLToPath } = await import('url')

    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const sqlPath = path.join(__dirname, 'init.sql')

    const sql = await fs.readFile(sqlPath, 'utf8')

    // Split by semicolon and filter out comments and empty statements
    const statements = sql
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'))

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await db.execute(statement)
        } catch (error) {
          // Ignore duplicate key errors for sample data
          if (error.code !== 'ER_DUP_ENTRY') {
            throw error
          }
        }
      }
    }

    console.log('✅ Database initialized successfully')
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

// Create database if not exists
export async function createDatabaseIfNotExists() {
  try {
    const tempConfig = { ...dbConfig }
    const { database, ...configWithoutDb } = tempConfig

    const tempConnection = await mysql.createConnection(configWithoutDb)

    // Create database if it doesn't exist
    await tempConnection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    )

    await tempConnection.end()
    console.log(`✅ Database '${database}' is ready`)
    return true
  } catch (error) {
    console.error('❌ Database creation failed:', error)
    return false
  }
}
