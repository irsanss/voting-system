import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(64).optional(),
  SESSION_SECRET: z.string().min(64).optional(),
  CSRF_SECRET: z.string().min(64).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  REDIS_URL: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAX_FILE_SIZE: z.coerce.number().default(5 * 1024 * 1024), // 5MB
  UPLOAD_DIR: z.string().default('./uploads'),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  SESSION_TIMEOUT: z.coerce.number().default(24 * 60 * 60), // 24 hours
  MAX_LOGIN_ATTEMPTS: z.coerce.number().default(5),
  LOGIN_BLOCK_DURATION: z.coerce.number().default(30 * 60), // 30 minutes
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  SENTRY_DSN: z.string().optional(),
})

function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Invalid environment variables:', error)
    process.exit(1)
  }
}

export const env = validateEnv()

// Security configuration
export const securityConfig = {
  encryption: {
    key: env.ENCRYPTION_KEY,
    algorithm: 'aes-256-cbc',
    keyLength: 32,
    ivLength: 16,
  },
  session: {
    secret: env.SESSION_SECRET,
    timeout: env.SESSION_TIMEOUT,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    rotationThreshold: 12 * 60 * 60 * 1000, // 12 hours
  },
  csrf: {
    secret: env.CSRF_SECRET,
    tokenExpiry: 60 * 60 * 1000, // 1 hour
  },
  auth: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    maxLoginAttempts: env.MAX_LOGIN_ATTEMPTS,
    blockDuration: env.LOGIN_BLOCK_DURATION * 1000, // Convert to milliseconds
  },
  upload: {
    maxSize: env.MAX_FILE_SIZE,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'text/csv', 'application/pdf'],
    maxRecords: 1000,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    loginAttempts: env.MAX_LOGIN_ATTEMPTS,
    loginWindow: 15 * 60 * 1000, // 15 minutes
    registrationAttempts: 3,
    registrationWindow: 60 * 60 * 1000, // 1 hour
  },
} as const

// Development warnings
if (env.NODE_ENV === 'development') {
  if (!env.ENCRYPTION_KEY) {
    console.warn('⚠️  ENCRYPTION_KEY not set. Using default key (not secure for production)')
  }
  if (!env.SESSION_SECRET) {
    console.warn('⚠️  SESSION_SECRET not set. Using default key (not secure for production)')
  }
  if (!env.CSRF_SECRET) {
    console.warn('⚠️  CSRF_SECRET not set. Using default key (not secure for production)')
  }
}

// Production requirements
if (env.NODE_ENV === 'production') {
  const requiredVars = ['ENCRYPTION_KEY', 'SESSION_SECRET', 'CSRF_SECRET']
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables for production:', missingVars)
    process.exit(1)
  }
  
  if (env.DATABASE_URL.includes('dev.db')) {
    console.error('❌ Using development database in production')
    process.exit(1)
  }
}