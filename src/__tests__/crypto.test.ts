import { encrypt, decrypt, generateSecureToken, generateSessionId } from '@/lib/crypto'

// Set up environment variable for testing
process.env.ENCRYPTION_KEY = 'a'.repeat(64) // 256-bit key in hex

describe('Crypto Utilities', () => {
  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const originalData = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'VOTER',
      }

      const encrypted = await encrypt(originalData)
      const decrypted = await decrypt(encrypted)

      expect(decrypted).toEqual(originalData)
    })

    it('should handle different data types', async () => {
      const testCases = [
        { string: 'test string' },
        { number: 42 },
        { array: [1, 2, 3] },
        { boolean: true },
        { null: null },
        { nested: { a: 1, b: { c: 2 } } },
      ]

      for (const testCase of testCases) {
        const encrypted = await encrypt(testCase)
        const decrypted = await decrypt(encrypted)
        expect(decrypted).toEqual(testCase)
      }
    })

    it('should throw error for invalid encrypted data', async () => {
      const invalidData = 'invalid:encrypted:data'

      await expect(decrypt(invalidData)).rejects.toThrow('Decryption failed')
    })

    it('should throw error for malformed encrypted data', async () => {
      const malformedData = 'invalidformat'

      await expect(decrypt(malformedData)).rejects.toThrow('Decryption failed')
    })

    it('should produce different encrypted values for same data', async () => {
      const data = { test: 'data' }

      const encrypted1 = await encrypt(data)
      const encrypted2 = await encrypt(data)

      expect(encrypted1).not.toBe(encrypted2)
    })

    it('should handle empty object', async () => {
      const data = {}

      const encrypted = await encrypt(data)
      const decrypted = await decrypt(encrypted)

      expect(decrypted).toEqual(data)
    })
  })

  describe('generateSecureToken', () => {
    it('should generate token with default length', () => {
      const token = generateSecureToken()
      expect(token).toHaveLength(64) // 32 bytes * 2 (hex)
      expect(/^[a-f0-9]+$/i.test(token)).toBe(true)
    })

    it('should generate token with custom length', () => {
      const token = generateSecureToken(16)
      expect(token).toHaveLength(32) // 16 bytes * 2 (hex)
      expect(/^[a-f0-9]+$/i.test(token)).toBe(true)
    })

    it('should generate different tokens each time', () => {
      const token1 = generateSecureToken()
      const token2 = generateSecureToken()

      expect(token1).not.toBe(token2)
    })

    it('should handle zero length', () => {
      const token = generateSecureToken(0)
      expect(token).toHaveLength(0)
    })
  })

  describe('generateSessionId', () => {
    it('should generate session ID with correct length', () => {
      const sessionId = generateSessionId()
      expect(sessionId).toHaveLength(128) // 64 bytes * 2 (hex)
      expect(/^[a-f0-9]+$/i.test(sessionId)).toBe(true)
    })

    it('should generate different session IDs each time', () => {
      const sessionId1 = generateSessionId()
      const sessionId2 = generateSessionId()

      expect(sessionId1).not.toBe(sessionId2)
    })
  })
})