import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { createUser } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import { logSecurityEvent, SECURITY_EVENTS } from '@/lib/security'
import { validateAndSanitizeEmail, validateAndSanitizeName, validateAndSanitizeApartmentUnit } from '@/lib/validation'
import { addSecurityHeaders, createSecureResponse, createErrorResponse, validateRequest } from '@/lib/middleware'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_RECORDS = 1000
const ALLOWED_MIME_TYPES = ['text/csv', 'application/csv', 'text/plain']

export async function POST(request: NextRequest) {
  try {
    // Validate request
    const requestValidation = validateRequest(request)
    if (!requestValidation.isValid) {
      return createErrorResponse(requestValidation.error || 'Invalid request', 400)
    }

    const session = await getSession()
    if (!session) {
      return createErrorResponse('Authentication required', 401)
    }

    // Check permissions
    if (session.role !== 'SUPERADMIN' && session.role !== 'COMMITTEE') {
      await logSecurityEvent({
        type: SECURITY_EVENTS.DATA_ACCESSED_UNAUTHORIZED,
        details: { 
          userId: session.userId,
          action: 'IMPORT_USERS',
          role: session.role 
        },
        severity: 'MEDIUM',
        userId: session.userId,
        ipAddress: request.ip,
        userAgent: request.headers.get('user-agent'),
      })
      return createErrorResponse('Insufficient permissions', 403)
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const defaultPassword = formData.get('defaultPassword') as string || 'changeme123'
    const defaultRole = formData.get('defaultRole') as string || 'VOTER'

    // Validate file
    if (!file) {
      return createErrorResponse('No file provided', 400)
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      await logSecurityEvent({
        type: SECURITY_EVENTS.SUSPICIOUS_ACTIVITY_DETECTED,
        details: { 
          userId: session.userId,
          action: 'IMPORT_LARGE_FILE',
          fileSize: file.size,
          maxSize: MAX_FILE_SIZE
        },
        severity: 'MEDIUM',
        userId: session.userId,
      })
      return createErrorResponse('File too large', 400)
    }

    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      await logSecurityEvent({
        type: SECURITY_EVENTS.SUSPICIOUS_ACTIVITY_DETECTED,
        details: { 
          userId: session.userId,
          action: 'IMPORT_INVALID_FILE_TYPE',
          fileType: file.type
        },
        severity: 'MEDIUM',
        userId: session.userId,
      })
      return createErrorResponse('Invalid file type. Only CSV files are allowed', 400)
    }

    // Check file extension
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return createErrorResponse('Invalid file extension. Only CSV files are allowed', 400)
    }

    // Read file content
    const text = await file.text()
    
    // Validate content length
    if (text.length > 10 * 1024 * 1024) { // 10MB of text
      return createErrorResponse('File content too large', 400)
    }

    // Parse CSV with strict options
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: false,
      skip_lines_with_empty_values: true,
      max_records: MAX_RECORDS,
    })

    if (records.length === 0) {
      return createErrorResponse('CSV file is empty', 400)
    }

    if (records.length > MAX_RECORDS) {
      return createErrorResponse(`Too many records. Maximum allowed: ${MAX_RECORDS}`, 400)
    }

    // Validate required columns
    const requiredColumns = ['email', 'name']
    const columns = Object.keys(records[0])
    const missingColumns = requiredColumns.filter(col => !columns.includes(col))
    
    if (missingColumns.length > 0) {
      return createErrorResponse(`Missing required columns: ${missingColumns.join(', ')}`, 400)
    }

    // Check for too many columns (potential injection)
    if (columns.length > 20) {
      await logSecurityEvent({
        type: SECURITY_EVENTS.SUSPICIOUS_ACTIVITY_DETECTED,
        details: { 
          userId: session.userId,
          action: 'IMPORT_TOO_MANY_COLUMNS',
          columnCount: columns.length
        },
        severity: 'MEDIUM',
        userId: session.userId,
      })
      return createErrorResponse('Too many columns in CSV', 400)
    }

    // Process records with validation
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      warnings: [] as string[],
    }

    const seenEmails = new Set<string>()

    for (let i = 0; i < records.length; i++) {
      const record = records[i] as any
      const rowNumber = i + 2 // Account for header row
      
      try {
        // Validate and sanitize email
        if (!record.email || typeof record.email !== 'string') {
          results.failed++
          results.errors.push(`Row ${rowNumber}: Invalid or missing email`)
          continue
        }

        const sanitizedEmail = validateAndSanitizeEmail(record.email.trim())
        
        // Check for duplicate emails in the same file
        if (seenEmails.has(sanitizedEmail)) {
          results.failed++
          results.errors.push(`Row ${rowNumber}: Duplicate email in file`)
          continue
        }
        seenEmails.add(sanitizedEmail)

        // Check if user already exists
        const existingUser = await db.user.findUnique({
          where: { email: sanitizedEmail },
        })

        if (existingUser) {
          results.failed++
          results.errors.push(`Row ${rowNumber}: User with email ${sanitizedEmail} already exists`)
          continue
        }

        // Validate and sanitize name
        let sanitizedName
        try {
          sanitizedName = record.name ? validateAndSanitizeName(record.name.trim()) : undefined
        } catch (error) {
          results.failed++
          results.errors.push(`Row ${rowNumber}: Invalid name format`)
          continue
        }

        // Validate and sanitize optional fields
        let sanitizedUnit
        if (record.apartmentUnit) {
          try {
            sanitizedUnit = validateAndSanitizeApartmentUnit(record.apartmentUnit.trim())
          } catch (error) {
            results.warnings.push(`Row ${rowNumber}: Invalid apartment unit format, skipping`)
          }
        }

        let sanitizedSize
        if (record.apartmentSize) {
          const size = parseFloat(record.apartmentSize)
          if (!isNaN(size) && size > 0 && size <= 1000) {
            sanitizedSize = size
          } else {
            results.warnings.push(`Row ${rowNumber}: Invalid apartment size, skipping`)
          }
        }

        // Validate language
        let sanitizedLanguage = 'en'
        if (record.language && ['en', 'id'].includes(record.language.trim().toLowerCase())) {
          sanitizedLanguage = record.language.trim().toLowerCase()
        }

        // Create user
        await createUser({
          email: sanitizedEmail,
          name: sanitizedName,
          password: defaultPassword,
          role: defaultRole as UserRole,
          apartmentUnit: sanitizedUnit,
          apartmentSize: sanitizedSize,
          language: sanitizedLanguage,
        })

        results.success++
      } catch (error: any) {
        results.failed++
        results.errors.push(`Row ${rowNumber}: ${error.message}`)
      }
    }

    // Log import activity
    await logSecurityEvent({
      type: SECURITY_EVENTS.DATA_IMPORT,
      details: { 
        userId: session.userId,
        fileName: file.name,
        totalRecords: records.length,
        successCount: results.success,
        failureCount: results.failed,
        defaultRole,
      },
      severity: 'LOW',
      userId: session.userId,
      ipAddress: request.ip,
      userAgent: request.headers.get('user-agent'),
    })

    return createSecureResponse({
      message: 'Import completed',
      results,
    })
  } catch (error) {
    console.error('Import error:', error)
    
    // Log security event for unexpected errors
    await logSecurityEvent({
      type: SECURITY_EVENTS.SUSPICIOUS_ACTIVITY_DETECTED,
      details: { 
        action: 'IMPORT_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      severity: 'MEDIUM',
    })

    return createErrorResponse('Internal server error', 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return createErrorResponse('Authentication required', 401)
    }

    // Check permissions
    if (session.role !== 'SUPERADMIN' && session.role !== 'COMMITTEE') {
      return createErrorResponse('Insufficient permissions', 403)
    }

    // Generate safe CSV template
    const template = [
      'email,name,apartmentUnit,apartmentSize,language',
      'john.doe@example.com,John Doe,A-101,85.5,en',
      'jane.smith@example.com,Jane Smith,B-205,120.0,en',
      'ahmad.wijaya@example.com,Ahmad Wijaya,C-301,95.0,id',
    ].join('\n')

    const response = new NextResponse(template, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="voter-import-template.csv"',
      },
    })

    return addSecurityHeaders(response)
  } catch (error) {
    console.error('Template generation error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}