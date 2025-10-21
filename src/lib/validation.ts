import { z } from 'zod'

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Password requirements
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128

// Apartment unit validation
const APARTMENT_UNIT_REGEX = /^[A-Z]-\d{3}[A-Z]?$/

// Name validation
const NAME_REGEX = /^[a-zA-Z\s'-]{1,100}$/

// Project title validation
const PROJECT_TITLE_REGEX = /^[a-zA-Z0-9\s\-_.,!?()]{1,200}$/

// Common validation schemas
export const emailSchema = z.string()
  .min(1, 'Email is required')
  .max(254, 'Email is too long')
  .regex(EMAIL_REGEX, 'Invalid email format')

export const passwordSchema = z.string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be less than ${PASSWORD_MAX_LENGTH} characters`)
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .regex(NAME_REGEX, 'Name can only contain letters, spaces, hyphens, and apostrophes')

export const apartmentUnitSchema = z.string()
  .min(1, 'Apartment unit is required')
  .max(10, 'Apartment unit is too long')
  .regex(APARTMENT_UNIT_REGEX, 'Apartment unit must be in format A-101 or A-101A')

export const apartmentSizeSchema = z.number()
  .min(20, 'Apartment size must be at least 20m²')
  .max(1000, 'Apartment size must be less than 1000m²')

export const projectTitleSchema = z.string()
  .min(1, 'Project title is required')
  .max(200, 'Project title is too long')
  .regex(PROJECT_TITLE_REGEX, 'Project title contains invalid characters')

export const projectDescriptionSchema = z.string()
  .max(1000, 'Description is too long')
  .optional()

// User registration schema
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema.optional(),
  role: z.enum(['VOTER', 'CANDIDATE', 'COMMITTEE', 'AUDITOR', 'SUPERVISOR', 'SUPERADMIN']).optional(),
  apartmentUnit: apartmentUnitSchema.optional(),
  apartmentSize: z.coerce.number().optional().transform(val =>
    val !== undefined ? apartmentSizeSchema.parse(val) : undefined
  ),
  language: z.enum(['en', 'id']).default('en'),
})

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// Project creation schema
export const projectCreationSchema = z.object({
  title: projectTitleSchema,
  description: projectDescriptionSchema,
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  isActive: z.boolean().default(false),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
})

// Vote casting schema
export const voteCastingSchema = z.object({
  candidateId: z.string().min(1, 'Candidate ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
})

// Candidate creation schema
export const candidateCreationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  name: nameSchema,
  photo: z.string().url().optional(),
  vision: z.string().max(2000, 'Vision is too long').optional(),
  mission: z.string().max(2000, 'Mission is too long').optional(),
  reason: z.string().max(2000, 'Reason is too long').optional(),
  teamMembers: z.array(z.string().max(100, 'Team member name is too long')).max(10, 'Too many team members').optional(),
  images: z.array(z.string().url()).max(10, 'Too many images').optional(),
  videos: z.array(z.string().url()).max(5, 'Too many videos').optional(),
})

// Sanitization functions
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ')
}

export function validateAndSanitizeEmail(email: string): string {
  const sanitized = sanitizeString(email.toLowerCase())
  const result = emailSchema.safeParse(sanitized)
  if (!result.success) {
    throw new Error('Invalid email format')
  }
  return result.data
}

export function validateAndSanitizeName(name: string): string {
  const sanitized = sanitizeString(name)
  const result = nameSchema.safeParse(sanitized)
  if (!result.success) {
    throw new Error('Invalid name format')
  }
  return result.data
}

export function validateAndSanitizeApartmentUnit(unit: string): string {
  const sanitized = sanitizeString(unit.toUpperCase())
  const result = apartmentUnitSchema.safeParse(sanitized)
  if (!result.success) {
    throw new Error('Invalid apartment unit format')
  }
  return result.data
}

// Rate limiting configuration (relaxed for better user experience)
export const RATE_LIMITS = {
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 20, // Increased from 5 to 20 attempts
    blockDuration: 5 * 60 * 1000, // Reduced from 30 minutes to 5 minutes
  },
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 10, // Increased from 3 to 10 attempts
    blockDuration: 15 * 60 * 1000, // Reduced from 1 hour to 15 minutes
  },
  voting: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxAttempts: 1, // One vote per project per day (kept strict for integrity)
  },
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 300, // Increased from 100 to 300 requests
  },
}