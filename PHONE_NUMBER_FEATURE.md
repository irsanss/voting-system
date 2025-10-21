# Phone Number Feature - Profile Page

## Overview
Added phone number field to the user profile page, allowing users to view and update their phone number information.

## Changes Made

### 1. Database Schema
The `User` model already includes a `phone` field:
```prisma
model User {
  ...
  phone           String?
  ...
}
```

### 2. Profile Page Updates (`/src/app/profile/page.tsx`)

#### Added Phone Number Field to Form State
```typescript
const [formData, setFormData] = useState({
    name: '',
    phone: '',          // NEW: Phone number field
    apartmentUnit: '',
    apartmentSize: '',
    language: 'en',
})
```

#### Added Phone Input in Personal Information Section
Located between Email and Role fields:
```tsx
<div className="space-y-2">
    <Label htmlFor="phone">Phone Number</Label>
    <Input
        id="phone"
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        placeholder="e.g., +62 812 3456 7890"
    />
</div>
```

#### Updated Save Handler
- Connects to new `/api/profile` endpoint
- Sends phone number data along with other profile fields
- Updates language in localStorage if changed
- Shows success/error messages

### 3. API Endpoints

#### Created Profile Update Endpoint (`/src/app/api/profile/route.ts`)
**Endpoint:** `PATCH /api/profile`

**Features:**
- Validates user session
- Updates user profile fields (name, phone, apartmentUnit, apartmentSize, language)
- Creates audit log for profile updates
- Returns updated user data

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+62 812 3456 7890",
  "apartmentUnit": "A-101",
  "apartmentSize": "85.5",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+62 812 3456 7890",
    "role": "VOTER",
    "apartmentUnit": "A-101",
    "apartmentSize": 85.5,
    "language": "en",
    ...
  }
}
```

#### Updated Auth Me Endpoint (`/src/app/api/auth/me/route.ts`)
Added `phone` field to the user data selection:
```typescript
select: {
  id: true,
  email: true,
  name: true,
  phone: true,    // NEW: Include phone in response
  role: true,
  apartmentUnit: true,
  apartmentSize: true,
  language: true,
  isActive: true,
  createdAt: true,
}
```

## User Experience

### Profile Page Layout
The phone number field appears in the "Personal Information" section with the following layout (2-column grid):

**Row 1:**
- Full Name | Email (disabled)

**Row 2:**
- Phone Number | Role (disabled)

**Row 3:**
- Member Since (disabled) | Apartment Unit

**Row 4:**
- Apartment Size | Preferred Language

### Validation
- Phone field accepts any text input (basic `type="tel"`)
- Server-side trims whitespace
- Optional field (can be empty)

### User Workflow
1. User navigates to `/profile`
2. Phone number is loaded from database (if exists)
3. User can edit phone number
4. Click "Save Changes" button
5. System validates session and updates database
6. Success message displayed
7. Audit log created for tracking

## Security Features

1. **Session Validation**: Only authenticated users can update profiles
2. **User Isolation**: Users can only update their own profile (based on session userId)
3. **Input Sanitization**: Phone number is trimmed of whitespace
4. **Audit Logging**: All profile updates are logged with timestamp and user ID

## Testing Checklist

- [ ] Navigate to http://127.0.0.1:3000/profile
- [ ] Verify phone number field is visible
- [ ] Test with existing phone number (should load from database)
- [ ] Test updating phone number with valid format (+62 812 3456 7890)
- [ ] Test saving changes (should show success message)
- [ ] Refresh page and verify phone number persists
- [ ] Test clearing phone number (empty value)
- [ ] Verify audit log entry is created
- [ ] Test with different user roles (VOTER, ADMIN, etc.)
- [ ] Verify responsive layout on mobile devices

## Future Enhancements

1. **Phone Validation**: Add regex validation for phone number formats
2. **Country Code Selector**: Add dropdown for country codes
3. **Phone Verification**: Send SMS verification code
4. **Format As You Type**: Auto-format phone number while typing
5. **International Format**: Support multiple phone number formats
6. **Required Field**: Make phone number mandatory for certain roles
7. **Duplicate Check**: Prevent multiple users from using same phone number

## Database Migration

No migration needed - the `phone` field already exists in the User model.

If adding to a new database:
```bash
npx prisma generate
npx prisma db push
```

## API Documentation

### PATCH /api/profile

Updates the authenticated user's profile information.

**Headers:**
- `Content-Type: application/json`
- Requires valid session cookie

**Request Body:** (All fields optional)
```typescript
{
  name?: string
  phone?: string
  apartmentUnit?: string
  apartmentSize?: string | number
  language?: 'en' | 'id'
}
```

**Success Response:** (200 OK)
```typescript
{
  success: true
  message: string
  user: User
}
```

**Error Responses:**
- `401 Unauthorized` - No valid session
- `500 Internal Server Error` - Database or server error

## Related Files

- `/src/app/profile/page.tsx` - Profile page UI
- `/src/app/api/profile/route.ts` - Profile update endpoint
- `/src/app/api/auth/me/route.ts` - Get current user endpoint
- `/prisma/schema.prisma` - Database schema
- `/src/lib/session.ts` - Session management

## Notes

- Phone number is stored as plain text without formatting
- No duplicate phone number validation currently implemented
- Phone field is optional and can be left empty
- Audit logs track all profile updates including phone changes
