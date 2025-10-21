# Vote Status and Revocation Feature

## Overview
This feature allows voters to see their voting status on the dashboard and revoke their vote if they want to change it during the voting period.

## Changes Made

### 1. Enhanced Vote Check API
**File:** `/src/app/api/votes/check/route.ts`

**Changes:**
- Added `candidate` information to the response (id, name, photo)
- Added `voteId` to the response
- Returns complete vote details when user has voted

**Response Format:**
```json
{
  "hasVoted": true,
  "voteTimestamp": "2025-10-21T10:30:00.000Z",
  "candidate": {
    "id": "candidate_id",
    "name": "Candidate Name",
    "photo": "photo_url"
  },
  "voteId": "vote_id"
}
```

### 2. New Vote Revocation API
**File:** `/src/app/api/votes/revoke/route.ts`

**Endpoint:** `POST /api/votes/revoke`

**Features:**
- Allows users to revoke their vote during the voting period
- Validates that voting is still open
- Deletes the vote from the database
- Creates audit log entry for vote revocation
- Returns success message

**Request Body:**
```json
{
  "projectId": "project_id"
}
```

**Security:**
- Requires authentication
- Only allows revocation during active voting period
- Only allows users to revoke their own votes
- Creates audit trail

**Audit Log Details:**
- Action: `VOTE_REVOKED`
- Includes: candidateId, candidateName, voteId, originalVoteTime
- Records IP address and user agent

### 3. Dashboard Vote Status Display
**File:** `/src/app/dashboard/page.tsx`

**New State:**
```typescript
const [userVote, setUserVote] = useState<{
  hasVoted: boolean
  voteTimestamp: string | null
  candidate: { id: string; name: string; photo?: string } | null
  voteId: string | null
} | null>(null)
const [revokingVote, setRevokingVote] = useState(false)
```

**New Functions:**
1. `checkUserVote(projectId)` - Fetches user's vote status for a project
2. `handleRevokeVote()` - Handles vote revocation with confirmation

**UI Changes:**

#### When User Has NOT Voted:
- Shows "Cast Your Vote" card (original)
- Primary color border (`border-primary/50`)
- Blue background tint (`bg-primary/5`)
- Green "Active" badge
- Large "Vote Now" button
- Displays voting deadline

#### When User HAS Voted:
- Shows "You Have Voted" card
- Green color scheme (`border-green-500/50`, `bg-green-50/50`)
- Green "Voted" badge with checkmark
- Displays:
  - Candidate photo (if available)
  - Candidate name in bold green
  - Vote timestamp
  - "Revoke Vote" button (red/destructive)
- White inner card with vote details

**Features:**
- Real-time vote status checking
- Confirmation dialog before revoking
- Success/error alerts
- Automatic refresh after revocation
- Disabled state while revoking

## User Flow

### Casting Initial Vote:
1. User logs in and navigates to dashboard
2. Sees "Cast Your Vote" section for active projects
3. Clicks "Vote Now" button
4. Completes voting on vote page
5. Returns to dashboard
6. Sees "You Have Voted" section with vote details

### Revoking Vote:
1. User views "You Have Voted" section
2. Clicks "Revoke Vote" button
3. Confirms in dialog: "Are you sure you want to revoke your vote?"
4. System deletes vote and creates audit log
5. Dashboard refreshes
6. "Cast Your Vote" section appears again
7. User can vote again for a different candidate

## Security & Validation

### Vote Revocation Rules:
- ✅ User must be authenticated
- ✅ Vote must exist for the user in that project
- ✅ Voting period must still be active
- ✅ Can only revoke own votes
- ✅ Audit log created for every revocation

### Edge Cases Handled:
- Attempting to revoke after voting period ends → Error message
- Attempting to revoke non-existent vote → Error message
- Multiple rapid revoke attempts → Button disabled during processing
- Network errors → Error alerts shown to user

## Audit Trail

Every vote revocation is logged with:
```json
{
  "action": "VOTE_REVOKED",
  "userId": "user_id",
  "projectId": "project_id",
  "details": {
    "candidateId": "candidate_id",
    "candidateName": "Candidate Name",
    "voteId": "vote_id",
    "originalVoteTime": "2025-10-21T10:30:00.000Z"
  },
  "ipAddress": "user_ip",
  "userAgent": "user_agent",
  "timestamp": "2025-10-21T11:45:00.000Z"
}
```

## UI Components Used

### New Imports:
- `CheckCircle` icon from lucide-react

### Existing Components:
- Card, CardHeader, CardTitle, CardDescription, CardContent
- Button (with destructive variant)
- Badge
- Link

### Design Tokens:
- `border-green-500/50` - Green border for voted state
- `bg-green-50/50` - Light green background for voted state
- `bg-green-600` - Green badge background
- `text-green-700` - Green text for candidate name
- `border-green-200` - Light green border for inner card
- `variant="destructive"` - Red button for revoke action

## Testing Checklist

### Vote Status Display:
- [ ] Dashboard shows "Cast Your Vote" for active projects when not voted
- [ ] Dashboard shows "You Have Voted" after voting
- [ ] Candidate name displays correctly
- [ ] Candidate photo displays (if available)
- [ ] Vote timestamp displays in correct format
- [ ] Green checkmark badge shows "Voted" status

### Vote Revocation:
- [ ] "Revoke Vote" button appears when user has voted
- [ ] Confirmation dialog appears when clicking "Revoke Vote"
- [ ] Vote is deleted from database after confirmation
- [ ] Audit log is created with correct details
- [ ] Dashboard refreshes and shows "Cast Your Vote" again
- [ ] User can vote again after revoking
- [ ] Button shows "Revoking..." during processing
- [ ] Button is disabled during processing

### Error Handling:
- [ ] Cannot revoke vote after voting period ends
- [ ] Cannot revoke non-existent vote
- [ ] Error message shown if revocation fails
- [ ] Network errors handled gracefully

### Project Switching:
- [ ] Vote status updates when switching between projects
- [ ] Each project shows correct vote status
- [ ] Vote status persists across page refreshes

## API Endpoints Summary

| Endpoint | Method | Purpose | Authentication |
|----------|--------|---------|----------------|
| `/api/votes/check?projectId=xxx` | GET | Check user's vote status | Required |
| `/api/votes/revoke` | POST | Revoke user's vote | Required |

## Database Changes

**None required** - Uses existing database schema.

The revoke functionality uses the existing `vote` table's unique constraint:
```prisma
@@unique([userId, projectId])
```

This ensures one vote per user per project, whether it's the initial vote or after revocation and re-voting.

## Files Modified

1. `/src/app/api/votes/check/route.ts` - Enhanced response
2. `/src/app/api/votes/revoke/route.ts` - New file
3. `/src/app/dashboard/page.tsx` - Added vote status UI and revocation

## Sample Screenshots Description

### Before Voting:
```
┌─────────────────────────────────────────────────┐
│ Cast Your Vote                      [Active] ✓  │
│ Project Name - Voting is currently active       │
│                                                 │
│ Voting ends: Oct 21, 2025 5:00 PM             │
│ Click below to participate                     │
│                                    [Vote Now]  │
└─────────────────────────────────────────────────┘
```

### After Voting:
```
┌─────────────────────────────────────────────────┐
│ ✓ You Have Voted                    [Voted] ✓  │
│ Project Name                                    │
│                                                 │
│ Your vote was cast for:                        │
│ ┌─────────────────────────────────────────────┐│
│ │ [Photo] John Doe                            ││
│ │                                             ││
│ │ ⏰ Voted on: Oct 21, 2025 10:30 AM         ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ Want to change your vote?                      │
│ You can revoke your current vote and vote again│
│                                 [Revoke Vote]  │
└─────────────────────────────────────────────────┘
```

## Next Steps (Optional Enhancements)

1. Add countdown timer until voting closes
2. Show vote revocation count in admin analytics
3. Add notification when vote is successfully revoked
4. Implement vote change history (multiple revocations)
5. Add rate limiting for vote revocations
6. Send email confirmation when vote is revoked
7. Add "Are you sure?" modal instead of browser confirm
8. Show vote weight in vote status display
9. Add animation when vote status changes
10. Export vote revocation audit logs
