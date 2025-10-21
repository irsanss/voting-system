import { cookies } from 'next/headers'
import { encrypt, decrypt, generateSessionId } from './crypto'
import { User } from '@prisma/client'
import { logSecurityEvent, SECURITY_EVENTS } from './security'
import { prisma } from './prisma'

export interface SessionData {
  sessionId: string
  userId: string
  email: string
  name?: string
  role: string
  language: string
  createdAt: number
  lastActivity: number
  ipAddress?: string
  userAgent?: string
}

const SESSION_COOKIE_NAME = 'voting-session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const MAX_SESSION_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days maximum
const SESSION_ROTATION_THRESHOLD = 12 * 60 * 60 * 1000 // 12 hours

// Cleanup expired sessions from database
async function cleanupExpiredSessions(): Promise<void> {
  try {
    const now = new Date()
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    })
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error)
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000)

export async function createSession(user: Omit<User, 'password'>, request?: Request): Promise<void> {
  const sessionId = generateSessionId()
  const now = Date.now()

  const sessionData: SessionData = {
    sessionId,
    userId: user.id,
    email: user.email,
    name: user.name || undefined,
    role: user.role,
    language: user.language,
    createdAt: now,
    lastActivity: now,
    ipAddress: request?.headers.get('x-forwarded-for') || undefined,
    userAgent: request?.headers.get('user-agent') || undefined,
  }

  // Store session in database
  const expiresAt = new Date(now + SESSION_DURATION)
  await prisma.session.create({
    data: {
      sessionId,
      userId: user.id,
      data: JSON.stringify(sessionData),
      expiresAt,
    }
  })

  // Create encrypted session cookie
  const encryptedSession = await encrypt(sessionData)

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, encryptedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
    // Add additional security attributes
    partitioned: true,
  })

  // Log session creation
  await logSecurityEvent({
    type: SECURITY_EVENTS.LOGIN_SUCCESS,
    details: {
      sessionId: sessionId.substring(0, 8) + '...',
      userId: user.id,
      email: user.email
    },
    severity: 'LOW',
    userId: user.id,
    ipAddress: sessionData.ipAddress,
    userAgent: sessionData.userAgent,
  })
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return null
  }

  try {
    const sessionData = await decrypt(sessionCookie.value) as SessionData

    // Validate session structure
    if (!sessionData.sessionId || !sessionData.userId || !sessionData.email) {
      throw new Error('Invalid session structure')
    }

    // Check if session exists in database
    const dbSession = await prisma.session.findUnique({
      where: { sessionId: sessionData.sessionId }
    })

    if (!dbSession) {
      throw new Error('Session not found in store')
    }

    // Check if session is expired
    const now = new Date()
    if (dbSession.expiresAt < now) {
      await prisma.session.delete({
        where: { sessionId: sessionData.sessionId }
      })
      throw new Error('Session expired')
    }

    // Parse stored session data
    const storedSession = JSON.parse(dbSession.data) as SessionData

    // Update last activity
    const updatedSessionData = {
      ...storedSession,
      lastActivity: Date.now()
    }

    await prisma.session.update({
      where: { sessionId: sessionData.sessionId },
      data: {
        data: JSON.stringify(updatedSessionData),
        updatedAt: now
      }
    })

    // Check if session should be rotated (security measure)
    if (Date.now() - storedSession.createdAt > SESSION_ROTATION_THRESHOLD) {
      await rotateSession(storedSession)
    }

    return updatedSessionData
  } catch (error) {
    console.error('Failed to decrypt or validate session:', error)

    // Log suspicious session activity
    await logSecurityEvent({
      type: SECURITY_EVENTS.INVALID_SESSION_ATTEMPT,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      severity: 'MEDIUM',
    })

    // Clear invalid session
    await destroySession()
    return null
  }
}

export async function updateSession(data: Partial<SessionData>): Promise<SessionData | null> {
  const currentSession = await getSession()
  if (!currentSession) {
    return null
  }

  const updatedSession = { ...currentSession, ...data, lastActivity: Date.now() }

  // Update in database
  await prisma.session.update({
    where: { sessionId: currentSession.sessionId },
    data: {
      data: JSON.stringify(updatedSession),
      updatedAt: new Date()
    }
  })

  // Update cookie
  const encryptedSession = await encrypt(updatedSession)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, encryptedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
    partitioned: true,
  })

  return updatedSession
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (sessionCookie?.value) {
    try {
      const sessionData = await decrypt(sessionCookie.value) as SessionData

      // Remove from database (if it exists)
      try {
        await prisma.session.delete({
          where: { sessionId: sessionData.sessionId }
        })
      } catch (deleteError) {
        // Session might already be deleted, that's ok
        console.log('Session already deleted or not found')
      }

      // Log session destruction
      await logSecurityEvent({
        type: 'LOGOUT',
        details: {
          sessionId: sessionData.sessionId.substring(0, 8) + '...',
          userId: sessionData.userId
        },
        severity: 'LOW',
        userId: sessionData.userId,
      })
    } catch (error) {
      console.error('Error destroying session:', error)
    }
  }

  // Clear cookie
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function rotateSession(session: SessionData): Promise<void> {
  const newSessionId = generateSessionId()
  const now = Date.now()

  // Create new session data
  const newSessionData: SessionData = {
    ...session,
    sessionId: newSessionId,
    createdAt: now,
    lastActivity: now,
  }

  // Remove old session from database
  await prisma.session.delete({
    where: { sessionId: session.sessionId }
  })

  // Add new session to database
  const expiresAt = new Date(now + SESSION_DURATION)
  await prisma.session.create({
    data: {
      sessionId: newSessionId,
      userId: session.userId,
      data: JSON.stringify(newSessionData),
      expiresAt,
    }
  })

  // Update cookie
  const encryptedSession = await encrypt(newSessionData)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, encryptedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
    partitioned: true,
  })

  // Log session rotation
  await logSecurityEvent({
    type: 'SESSION_ROTATED',
    details: {
      oldSessionId: session.sessionId.substring(0, 8) + '...',
      newSessionId: newSessionId.substring(0, 8) + '...',
      userId: session.userId
    },
    severity: 'LOW',
    userId: session.userId,
  })
}

export async function invalidateAllUserSessions(userId: string): Promise<void> {
  // Delete all sessions for the user from database
  const result = await prisma.session.deleteMany({
    where: { userId }
  })

  const invalidatedCount = result.count

  // Log mass session invalidation
  await logSecurityEvent({
    type: 'ALL_USER_SESSIONS_INVALIDATED',
    details: { userId, invalidatedCount },
    severity: 'MEDIUM',
    userId,
  })
}

export async function getActiveSessionCount(): Promise<number> {
  await cleanupExpiredSessions()
  return await prisma.session.count()
}

export async function getUserActiveSessions(userId: string): Promise<SessionData[]> {
  const dbSessions = await prisma.session.findMany({
    where: {
      userId,
      expiresAt: {
        gt: new Date()
      }
    }
  })

  return dbSessions.map(dbSession => JSON.parse(dbSession.data) as SessionData)
}