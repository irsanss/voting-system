import crypto from 'crypto'

// Use a consistent key for session encryption
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'voting-system-encryption-key-32-bytes'
const IV_LENGTH = 16

// Ensure the key is exactly 32 bytes for AES-256
function getEncryptionKey(): Buffer {
  const key = Buffer.from(ENCRYPTION_KEY, 'utf8')
  if (key.length < 32) {
    // Pad with zeros if too short
    const paddedKey = Buffer.alloc(32)
    key.copy(paddedKey)
    return paddedKey
  } else if (key.length > 32) {
    // Truncate if too long
    return key.slice(0, 32)
  }
  return key
}

export async function encrypt(data: any): Promise<string> {
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    return iv.toString('hex') + ':' + encrypted
  } catch (error) {
    throw new Error('Encryption failed')
  }
}

export async function decrypt(encryptedData: string): Promise<any> {
  try {
    const key = getEncryptionKey()
    const textParts = encryptedData.split(':')
    
    if (textParts.length !== 2) {
      throw new Error('Invalid encrypted data format')
    }
    
    const iv = Buffer.from(textParts[0], 'hex')
    const encryptedText = textParts[1]
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return JSON.parse(decrypted)
  } catch (error) {
    throw new Error('Decryption failed')
  }
}

// Generate a secure random token
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

// Generate a secure session ID
export function generateSessionId(): string {
  return generateSecureToken(64)
}