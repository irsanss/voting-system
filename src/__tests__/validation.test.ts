import {
  emailSchema,
  passwordSchema,
  nameSchema,
  apartmentUnitSchema,
  userRegistrationSchema,
  loginSchema,
  voteCastingSchema,
  sanitizeHtml,
  sanitizeString,
  validateAndSanitizeEmail,
  validateAndSanitizeName,
  validateAndSanitizeApartmentUnit,
} from '@/lib/validation'

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should validate valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ]

      validEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).not.toThrow()
      })
    })

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
        'test@.com',
        'test@example.',
        '',
      ]

      invalidEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).toThrow()
      })
    })

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'
      expect(() => emailSchema.parse(longEmail)).toThrow()
    })
  })

  describe('passwordSchema', () => {
    it('should validate strong passwords', () => {
      const validPasswords = [
        'StrongPass123!',
        'MySecure@Pass456',
        'Complex#Password789',
        'Test$Password0',
      ]

      validPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).not.toThrow()
      })
    })

    it('should reject weak passwords', () => {
      const invalidPasswords = [
        'weak', // too short
        'nouppercase123!', // no uppercase
        'NOLOWERCASE123!', // no lowercase
        'NoNumbers!', // no numbers
        'NoSpecialChars123', // no special characters
        'a'.repeat(130), // too long
      ]

      invalidPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).toThrow()
      })
    })
  })

  describe('nameSchema', () => {
    it('should validate valid names', () => {
      const validNames = [
        'John Doe',
        'Mary-Jane Smith',
        "O'Connor",
        'Jean-Claude Van Damme',
        'Maria Gonzalez',
      ]

      validNames.forEach(name => {
        expect(() => nameSchema.parse(name)).not.toThrow()
      })
    })

    it('should reject invalid names', () => {
      const invalidNames = [
        '', // empty
        'John123', // contains numbers
        'John@Doe', // contains special characters
        'a'.repeat(101), // too long
      ]

      invalidNames.forEach(name => {
        expect(() => nameSchema.parse(name)).toThrow()
      })
    })
  })

  describe('apartmentUnitSchema', () => {
    it('should validate valid apartment units', () => {
      const validUnits = [
        'A-101',
        'B-205A',
        'C-999',
        'Z-001B',
      ]

      validUnits.forEach(unit => {
        expect(() => apartmentUnitSchema.parse(unit)).not.toThrow()
      })
    })

    it('should reject invalid apartment units', () => {
      const invalidUnits = [
        'A101', // missing dash
        'A-10', // too short
        'A-1000', // too long
        '1-101', // starts with number
        'A-10a', // lowercase letter
        '', // empty
      ]

      invalidUnits.forEach(unit => {
        expect(() => apartmentUnitSchema.parse(unit)).toThrow()
      })
    })
  })

  describe('userRegistrationSchema', () => {
    it('should validate complete user registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'StrongPass123!',
        name: 'John Doe',
        apartmentUnit: 'A-101',
        apartmentSize: 75.5,
        language: 'en',
      }

      expect(() => userRegistrationSchema.parse(validData)).not.toThrow()
    })

    it('should validate minimal user registration data', () => {
      const minimalData = {
        email: 'test@example.com',
        password: 'StrongPass123!',
      }

      expect(() => userRegistrationSchema.parse(minimalData)).not.toThrow()
    })

    it('should reject invalid user registration data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'weak',
        name: 'John123',
        apartmentUnit: 'invalid',
        apartmentSize: 10, // too small
        language: 'fr', // unsupported language
      }

      expect(() => userRegistrationSchema.parse(invalidData)).toThrow()
    })
  })

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      }

      expect(() => loginSchema.parse(validData)).not.toThrow()
    })

    it('should reject invalid login data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: '', // empty password
      }

      expect(() => loginSchema.parse(invalidData)).toThrow()
    })
  })

  describe('voteCastingSchema', () => {
    it('should validate valid vote data', () => {
      const validData = {
        candidateId: 'candidate123',
        projectId: 'project456',
        location: {
          lat: 40.7128,
          lng: -74.0060,
        },
      }

      expect(() => voteCastingSchema.parse(validData)).not.toThrow()
    })

    it('should validate vote data without location', () => {
      const validData = {
        candidateId: 'candidate123',
        projectId: 'project456',
      }

      expect(() => voteCastingSchema.parse(validData)).not.toThrow()
    })

    it('should reject invalid vote data', () => {
      const invalidData = {
        candidateId: '', // empty
        projectId: 'project456',
        location: {
          lat: 91, // invalid latitude
          lng: -74.0060,
        },
      }

      expect(() => voteCastingSchema.parse(invalidData)).toThrow()
    })
  })
})

describe('Sanitization Functions', () => {
  describe('sanitizeHtml', () => {
    it('should escape HTML characters', () => {
      const input = '<script>alert("xss")</script>'
      const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      expect(sanitizeHtml(input)).toBe(expected)
    })

    it('should handle empty string', () => {
      expect(sanitizeHtml('')).toBe('')
    })

    it('should handle strings without HTML', () => {
      const input = 'Just plain text'
      expect(sanitizeHtml(input)).toBe(input)
    })
  })

  describe('sanitizeString', () => {
    it('should trim whitespace and normalize spaces', () => {
      const input = '  Hello   world  '
      const expected = 'Hello world'
      expect(sanitizeString(input)).toBe(expected)
    })

    it('should handle empty string', () => {
      expect(sanitizeString('')).toBe('')
    })

    it('should handle single word', () => {
      const input = 'hello'
      expect(sanitizeString(input)).toBe('hello')
    })
  })

  describe('validateAndSanitizeEmail', () => {
    it('should validate and sanitize valid email', () => {
      const email = '  TEST@EXAMPLE.COM  '
      const result = validateAndSanitizeEmail(email)
      expect(result).toBe('test@example.com')
    })

    it('should throw error for invalid email', () => {
      const invalidEmail = 'invalid-email'
      expect(() => validateAndSanitizeEmail(invalidEmail)).toThrow('Invalid email format')
    })
  })

  describe('validateAndSanitizeName', () => {
    it('should validate and sanitize valid name', () => {
      const name = '  John Doe  '
      const result = validateAndSanitizeName(name)
      expect(result).toBe('John Doe')
    })

    it('should throw error for invalid name', () => {
      const invalidName = 'John123'
      expect(() => validateAndSanitizeName(invalidName)).toThrow('Invalid name format')
    })
  })

  describe('validateAndSanitizeApartmentUnit', () => {
    it('should validate and sanitize valid apartment unit', () => {
      const unit = '  a-101  '
      const result = validateAndSanitizeApartmentUnit(unit)
      expect(result).toBe('A-101')
    })

    it('should throw error for invalid apartment unit', () => {
      const invalidUnit = 'invalid'
      expect(() => validateAndSanitizeApartmentUnit(invalidUnit)).toThrow('Invalid apartment unit format')
    })
  })
})