# Candidate Users Creation

## Overview
Created 9 candidate user accounts that align with the candidate names in the sample voting projects data. These users can log in to the system and have their profiles linked to the candidate information in each voting project.

## Created Candidate Users

### 2026 Head Apartments Election (4 Candidates)

1. **Michael Chen**
   - Email: `michael.chen@example.com`
   - Password: `password123`
   - Apartment: A-501 (120m²)
   - Phone: +1 (555) 101-2001
   - Vision: Building a sustainable and tech-forward community for the future

2. **Sarah Martinez**
   - Email: `sarah.martinez@example.com`
   - Password: `password123`
   - Apartment: B-302 (95.5m²)
   - Phone: +1 (555) 102-2002
   - Vision: Creating a family-friendly environment with strong community bonds

3. **James Wilson**
   - Email: `james.wilson@example.com`
   - Password: `password123`
   - Apartment: C-401 (110m²)
   - Phone: +1 (555) 103-2003
   - Vision: Modernizing facilities while preserving affordability and accessibility

4. **Priya Sharma**
   - Email: `priya.sharma@example.com`
   - Password: `password123`
   - Apartment: A-205 (88m²)
   - Phone: +1 (555) 104-2004
   - Vision: Fostering diversity, inclusion, and cultural harmony in our community

### 2025 Head Apartments Election (3 Candidates)

5. **Robert Taylor**
   - Email: `robert.taylor@example.com`
   - Password: `password123`
   - Apartment: B-501 (125m²)
   - Phone: +1 (555) 105-2005
   - Vision: Maintaining excellence in service and resident satisfaction

6. **Linda Martinez**
   - Email: `linda.martinez@example.com`
   - Password: `password123`
   - Apartment: C-201 (92m²)
   - Phone: +1 (555) 106-2006
   - Vision: Creating a vibrant, connected community through engagement

7. **Anthony Lee**
   - Email: `anthony.lee@example.com`
   - Password: `password123`
   - Apartment: A-301 (105m²)
   - Phone: +1 (555) 107-2007
   - Vision: Prioritizing safety, maintenance, and property value enhancement

### 2024 Head Apartments Election (2 Candidates)

8. **Daniel Kim**
   - Email: `daniel.kim@example.com`
   - Password: `password123`
   - Apartment: B-401 (115m²)
   - Phone: +1 (555) 108-2008
   - Vision: Building trust through transparency and effective management
   - **Winner of 2024 Election** (89 votes)

9. **Rebecca Foster**
   - Email: `rebecca.foster@example.com`
   - Password: `password123`
   - Apartment: C-101 (85m²)
   - Phone: +1 (555) 109-2009
   - Vision: Enhancing quality of life through community programs
   - Runner-up in 2024 election (54 votes)

## Files Created/Modified

### New Script Created
**`/scripts/create-candidate-users.ts`**
- Creates 9 candidate users with specific names matching the sample data
- Uses CANDIDATE role for all users
- Sets consistent password: `password123`
- Includes phone numbers, apartment units, and sizes
- Handles existing users gracefully (skips if already exists)

### Modified Seed Script
**`/scripts/seed-projects.ts`**
- Updated to look for candidate users by email first
- Falls back to index-based assignment if email not found
- Matches candidate profiles to specific user accounts
- Ensures proper linking between User and Candidate tables

## Usage

### Creating Candidate Users

Run the script to create all 9 candidate users:

```bash
cd "/Users/irsanss/Downloads/Visual Studio Code/voting2"
DATABASE_URL="file:./dev.db" npx tsx scripts/create-candidate-users.ts
```

### Re-seeding Projects (Optional)

If you want to relink the candidates to their user accounts:

```bash
DATABASE_URL="file:./dev.db" npx tsx scripts/seed-projects.ts
```

## Login Instructions

### For Candidates

1. Navigate to: http://127.0.0.1:3000/auth/login
2. Use credentials:
   - Email: `[candidate-name]@example.com` (e.g., `michael.chen@example.com`)
   - Password: `password123`
3. Will be redirected to candidate dashboard at `/candidate/dashboard`

### Testing Workflow

1. **As a Candidate:**
   - Login with candidate credentials
   - View your candidate profile
   - See which projects you're registered in
   - Track your voting statistics

2. **As an Admin:**
   - Login with admin account
   - Navigate to user management
   - View all candidate users in the system
   - Verify candidate profiles are linked correctly

3. **As a Voter:**
   - Login with voter credentials
   - View voting projects
   - See candidate information (name, photo, vision, mission)
   - Cast votes for candidates

## Technical Details

### User Model Fields
```typescript
{
  id: string (cuid)
  email: string (unique)
  name: string
  phone: string
  password: string (hashed with bcrypt)
  role: 'CANDIDATE'
  apartmentUnit: string
  apartmentSize: number
  language: 'en'
  isActive: true
  isVerified: true
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Candidate-User Relationship
```typescript
{
  User (1) ←→ (0..1) Candidate
  
  // Each user can have 0 or 1 candidate profile
  // Each candidate profile belongs to exactly 1 user
}
```

### Project-Candidate Relationship
```typescript
{
  VotingProject (1) ←→ (Many) Candidate
  
  // One project can have multiple candidates
  // Each candidate belongs to exactly one project
}
```

## Features

### Alignment with Sample Data
- User names match exactly with candidate names in seed data
- Proper email format: `firstname.lastname@example.com`
- Professional phone numbers with area code
- Realistic apartment assignments

### Security
- All passwords are hashed using bcrypt (salt rounds: 12)
- Verified status set to `true` (skip email verification)
- Active status enabled for immediate access

### Data Integrity
- Script checks for existing users before creating
- Skips duplicate entries to prevent errors
- Provides clear summary of created/skipped users
- Safe to run multiple times (idempotent)

## Verification

### Check Users in Database

Use Prisma Studio to verify:

```bash
npx prisma studio --port 5556
```

Navigate to `User` table and filter by:
- `role = 'CANDIDATE'`
- Email contains candidate names

### Check Candidate Profiles

In Prisma Studio, navigate to `Candidate` table:
- Verify each candidate has a `userId` linking to created users
- Check that names match between User and Candidate tables
- Verify project assignments are correct

### Test Login

Try logging in with each candidate:

```bash
# Example test credentials
Email: michael.chen@example.com
Password: password123

Email: daniel.kim@example.com  
Password: password123
```

## Benefits

1. **Realistic Testing**: Users can log in as actual candidates
2. **Complete Profiles**: Each candidate has full user account with contact info
3. **Proper Authentication**: Can test candidate-specific features
4. **Data Consistency**: User names match candidate profiles exactly
5. **Easy Management**: All users follow same password convention

## Notes

- All candidates use the same password (`password123`) for easy testing
- Phone numbers use a sequential pattern for easy identification
- Apartment sizes vary realistically (85m² to 125m²)
- Users are marked as verified to skip email verification step
- Script is safe to run multiple times (won't create duplicates)

## Future Enhancements

1. **Password Variety**: Generate unique passwords for each candidate
2. **Email Verification**: Add verification tokens and email sending
3. **Profile Photos**: Upload actual photos for each candidate
4. **Bio Information**: Add detailed biographical information
5. **Social Links**: Add LinkedIn, Twitter profiles
6. **Document Upload**: Enable candidates to upload resumes, certifications
7. **Password Reset**: Test password reset flow for candidate users

## Troubleshooting

### Issue: "Environment variable not found: DATABASE_URL"
**Solution**: Run with DATABASE_URL prefix:
```bash
DATABASE_URL="file:./dev.db" npx tsx scripts/create-candidate-users.ts
```

### Issue: "User already exists"
**Solution**: Script will skip existing users automatically. Check console output for summary.

### Issue: "Cannot login with candidate credentials"
**Solution**: 
1. Verify user was created in database
2. Check password is exactly `password123`
3. Ensure `isActive = true` in database
4. Clear browser cookies and try again

### Issue: "Candidate profile not showing"
**Solution**: Run seed-projects script to link User to Candidate:
```bash
DATABASE_URL="file:./dev.db" npx tsx scripts/seed-projects.ts
```

## Related Documentation

- `TEST-USERS.md` - Documentation for voter and admin test users
- `PHONE_NUMBER_FEATURE.md` - Phone number field implementation
- `scripts/seed-projects.ts` - Project seeding script
- `scripts/create-test-users.ts` - Voter/admin user creation script

## Summary

Successfully created 9 candidate user accounts with:
- ✅ Names matching sample data candidates
- ✅ Professional email addresses
- ✅ Phone numbers for contact
- ✅ Realistic apartment assignments
- ✅ CANDIDATE role for proper access
- ✅ Same password for easy testing: `password123`
- ✅ All users active and verified
- ✅ Ready to link to candidate profiles

These users can now:
- Login to the system
- Access candidate dashboard
- View their candidate profiles
- Track their voting statistics
- Manage their campaign information
