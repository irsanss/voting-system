# Test Users - Login Test Documentation

## Overview
This document contains test user credentials and testing procedures for the voting system.

## Test Users Created

### 👥 VOTER Users (5 users)
All voters have password: **password123**

| # | Email | Name | Apartment | Size (m²) | Expected Redirect |
|---|-------|------|-----------|-----------|-------------------|
| 1 | voter1@example.com | Alice Johnson | A101 | 85.5 | /dashboard |
| 2 | voter2@example.com | Bob Smith | A102 | 92.3 | /dashboard |
| 3 | voter3@example.com | Carol Williams | B201 | 78.0 | /dashboard |
| 4 | voter4@example.com | David Brown | B202 | 88.7 | /dashboard |
| 5 | voter5@example.com | Emma Davis | C301 | 95.2 | /dashboard |

### 👔 ADMINISTRATIVE Users (4 users)
All admin users have password: **password123**

| # | Email | Name | Role | Apartment | Size | Expected Redirect |
|---|-------|------|------|-----------|------|-------------------|
| 1 | committee1@example.com | Frank Martinez | COMMITTEE | N/A | 0 | /admin/dashboard |
| 2 | supervisor1@example.com | Grace Lee | SUPERVISOR | N/A | 0 | /supervisor/dashboard |
| 3 | auditor1@example.com | Henry Wilson | AUDITOR | N/A | 0 | /dashboard |
| 4 | superadmin1@example.com | Isabel Garcia | SUPERADMIN | N/A | 0 | /admin/dashboard |

## Testing Procedures

### 1. Test Voter Login (5 tests)
For each voter (voter1 through voter5):

**Steps:**
1. Navigate to: http://127.0.0.1:3000/auth/login
2. Enter email and password: `password123`
3. Click "Login"

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to `/dashboard`
- ✅ Can see voter dashboard with voting projects
- ✅ Can see their apartment information
- ✅ User menu shows correct name and role (VOTER)

**Test Data:**
```
Test 1: voter1@example.com / password123
Test 2: voter2@example.com / password123
Test 3: voter3@example.com / password123
Test 4: voter4@example.com / password123
Test 5: voter5@example.com / password123
```

### 2. Test Committee Login
**Steps:**
1. Navigate to: http://127.0.0.1:3000/auth/login
2. Email: `committee1@example.com`
3. Password: `password123`
4. Click "Login"

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to `/admin/dashboard`
- ✅ Can see admin navigation (Dashboard, Projects, Users, Reports, Analytics)
- ✅ User menu shows "Frank Martinez" with role COMMITTEE
- ✅ Apartment shows "N/A" and size shows "0"
- ✅ Cannot participate in voting

### 3. Test Supervisor Login
**Steps:**
1. Navigate to: http://127.0.0.1:3000/auth/login
2. Email: `supervisor1@example.com`
3. Password: `password123`
4. Click "Login"

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to `/supervisor/dashboard`
- ✅ Can see supervisor navigation (Dashboard, Projects, Reports)
- ✅ User menu shows "Grace Lee" with role SUPERVISOR
- ✅ Apartment shows "N/A" and size shows "0"
- ✅ Can see projects requiring supervisor review
- ✅ Can approve/reject projects with comments

### 4. Test Auditor Login
**Steps:**
1. Navigate to: http://127.0.0.1:3000/auth/login
2. Email: `auditor1@example.com`
3. Password: `password123`
4. Click "Login"

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to `/dashboard`
- ✅ Can see regular dashboard (similar to voter view)
- ✅ User menu shows "Henry Wilson" with role AUDITOR
- ✅ Apartment shows "N/A" and size shows "0"
- ✅ Cannot participate in voting

### 5. Test Superadmin Login
**Steps:**
1. Navigate to: http://127.0.0.1:3000/auth/login
2. Email: `superadmin1@example.com`
3. Password: `password123`
4. Click "Login"

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to `/admin/dashboard`
- ✅ Can see admin navigation with all features
- ✅ User menu shows "Isabel Garcia" with role SUPERADMIN
- ✅ Apartment shows "N/A" and size shows "0"
- ✅ Has full administrative access
- ✅ Can manage users, projects, reports, analytics
- ✅ Cannot participate in voting

## Additional Tests

### 6. Test Login with Wrong Password
**Steps:**
1. Navigate to: http://127.0.0.1:3000/auth/login
2. Email: `voter1@example.com`
3. Password: `wrongpassword`
4. Click "Login"

**Expected Results:**
- ❌ Login fails
- ⚠️ Error message displayed: "Invalid credentials"
- 🔄 User remains on login page

### 7. Test Login with Non-existent Email
**Steps:**
1. Navigate to: http://127.0.0.1:3000/auth/login
2. Email: `nonexistent@example.com`
3. Password: `password123`
4. Click "Login"

**Expected Results:**
- ❌ Login fails
- ⚠️ Error message displayed: "Invalid credentials"
- 🔄 User remains on login page

### 8. Test Logout Functionality
**Steps:**
1. Login with any user (e.g., voter1@example.com)
2. Click on user menu in top right
3. Click "Logout"

**Expected Results:**
- ✅ Session cleared
- ✅ Redirected to `/auth/login`
- ✅ Cannot access protected pages without logging in again

### 9. Test Session Persistence
**Steps:**
1. Login with any user
2. Navigate to any page
3. Refresh the browser (F5 or Cmd+R)

**Expected Results:**
- ✅ User remains logged in
- ✅ Session persists across page refreshes
- ✅ User stays on the current page

### 10. Test Role-Based Access Control
**Steps:**
1. Login as a voter (e.g., voter1@example.com)
2. Manually navigate to: http://127.0.0.1:3000/admin/dashboard

**Expected Results:**
- ❌ Access denied
- ✅ Redirected to appropriate page (either /dashboard or /auth/login)
- 🔒 Admin pages are protected from non-admin users

## Test Checklist

### Voter Accounts (5/5)
- [ ] voter1@example.com - Alice Johnson
- [ ] voter2@example.com - Bob Smith
- [ ] voter3@example.com - Carol Williams
- [ ] voter4@example.com - David Brown
- [ ] voter5@example.com - Emma Davis

### Administrative Accounts (4/4)
- [ ] committee1@example.com - Frank Martinez (COMMITTEE)
- [ ] supervisor1@example.com - Grace Lee (SUPERVISOR)
- [ ] auditor1@example.com - Henry Wilson (AUDITOR)
- [ ] superadmin1@example.com - Isabel Garcia (SUPERADMIN)

### Functionality Tests
- [ ] All voters can login and access voter dashboard
- [ ] Committee can login and access admin dashboard
- [ ] Supervisor can login and access supervisor dashboard
- [ ] Auditor can login and access dashboard
- [ ] Superadmin can login and access admin dashboard
- [ ] Wrong password is rejected
- [ ] Non-existent email is rejected
- [ ] Logout works correctly
- [ ] Session persists across refreshes
- [ ] Role-based access control is enforced

## Notes

### User Attributes
- **Voters**: Have apartment units and sizes, can participate in voting
- **Administrative Users**: 
  - Apartment Unit = "N/A"
  - Apartment Size = 0
  - Cannot participate in voting
  - Have elevated access based on role

### Password Policy
- Current test password: `password123`
- In production, enforce stronger passwords
- Consider implementing password reset functionality

### Security Considerations
- All users are set to `isVerified: true` and `isActive: true` for testing
- In production, implement email verification workflow
- Consider implementing 2FA for administrative users
- Implement account lockout after multiple failed login attempts

## Cleanup

To remove all test users, run:
```bash
cd "/Users/irsanss/Downloads/Visual Studio Code/voting2"
npx tsx scripts/remove-test-users.ts
```

To recreate test users:
```bash
cd "/Users/irsanss/Downloads/Visual Studio Code/voting2"
npx tsx scripts/create-test-users.ts
```

## Test Results
Document your test results below:

Date Tested: _______________
Tester: _______________

| Test Case | Status | Notes |
|-----------|--------|-------|
| Voter 1 Login | ⬜ Pass / ⬜ Fail | |
| Voter 2 Login | ⬜ Pass / ⬜ Fail | |
| Voter 3 Login | ⬜ Pass / ⬜ Fail | |
| Voter 4 Login | ⬜ Pass / ⬜ Fail | |
| Voter 5 Login | ⬜ Pass / ⬜ Fail | |
| Committee Login | ⬜ Pass / ⬜ Fail | |
| Supervisor Login | ⬜ Pass / ⬜ Fail | |
| Auditor Login | ⬜ Pass / ⬜ Fail | |
| Superadmin Login | ⬜ Pass / ⬜ Fail | |
| Wrong Password | ⬜ Pass / ⬜ Fail | |
| Invalid Email | ⬜ Pass / ⬜ Fail | |
| Logout | ⬜ Pass / ⬜ Fail | |
| Session Persistence | ⬜ Pass / ⬜ Fail | |
| Access Control | ⬜ Pass / ⬜ Fail | |
