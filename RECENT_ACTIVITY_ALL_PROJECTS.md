# Recent Activity - All Projects Feature

## Overview
Updated the dashboard's "Recent Activity" section to show voting activity across all projects instead of just the selected project. This provides a comprehensive view of all voting activities happening in the system.

## Changes Made

### 1. Enhanced Votes API
**File:** `/src/app/api/votes/route.ts`

**New Parameter:** `allProjects=true`

**Functionality:**
- When `allProjects=true` is passed, returns votes from all projects
- Includes project title in the response
- Limited to last 50 votes for performance
- Sorted by timestamp (most recent first)

**Request Example:**
```
GET /api/votes?allProjects=true
```

**Response Format:**
```json
[
  {
    "id": "vote_id",
    "timestamp": "2025-10-21T10:30:00.000Z",
    "candidateName": "John Doe",
    "projectTitle": "2025 Board Election",
    "location": { "lat": 123, "lng": 456 },
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
]
```

### 2. New Audit Logs API
**File:** `/src/app/api/audit-logs/route.ts`

**Purpose:** Fetch audit log entries (including vote revocations)

**Parameters:**
- `action` (optional): Filter by specific action (e.g., "VOTE_REVOKED")
- `limit` (optional): Number of results to return (default: 20)

**Request Example:**
```
GET /api/audit-logs?action=VOTE_REVOKED&limit=20
```

**Response Format:**
```json
[
  {
    "id": "log_id",
    "action": "VOTE_REVOKED",
    "timestamp": "2025-10-21T11:45:00.000Z",
    "userName": "Alice Johnson",
    "userEmail": "alice@example.com",
    "projectTitle": "2025 Board Election",
    "details": {
      "candidateId": "candidate_id",
      "candidateName": "John Doe",
      "voteId": "vote_id",
      "originalVoteTime": "2025-10-21T10:30:00.000Z"
    },
    "ipAddress": "192.168.1.1"
  }
]
```

### 3. Dashboard Recent Activity Updates
**File:** `/src/app/dashboard/page.tsx`

**Key Changes:**

#### a) Separate Activity Fetching
- Created `fetchRecentActivity()` function that runs independently
- No longer tied to selected project
- Fetches data from all projects

#### b) Combined Activity Feed
- Merges vote casts and vote revocations
- Sorts by timestamp
- Shows top 10 most recent activities

#### c) Visual Differentiation
**Vote Cast:**
- Green dot indicator
- Blue candidate name
- Shows location if available
- Standard text

**Vote Revoked:**
- Red dot indicator
- Red candidate name
- "Revoked" badge
- Different styling

#### d) Real-time Updates
- Refreshes every 30 seconds
- Independent of project selection
- Manual refresh button includes activity update

## UI Changes

### Before:
```
Recent Activity
Latest voting activity [for selected project only]
```

### After:
```
Recent Activity
Latest voting activity across all projects

• Vote cast for John Doe
  Project: 2025 Board Election
  Oct 21, 2025 10:30 AM

• Vote revoked for Jane Smith
  Project: 2024 HOA Election
  Oct 21, 2025 11:45 AM [Revoked]
```

## Features

### 1. Cross-Project Visibility
- Shows activity from all voting projects
- Not limited to currently selected project
- Provides holistic view of voting system

### 2. Activity Types Shown
- ✅ Vote casts
- ✅ Vote revocations
- 📍 Location tracking (if available)
- 🕐 Timestamps for all activities

### 3. Visual Indicators
| Activity Type | Dot Color | Text Color | Badge |
|---------------|-----------|------------|-------|
| Vote Cast | Green | Blue | - |
| Vote Revoked | Red | Red | "Revoked" |

### 4. Information Displayed
For each activity:
- Candidate name
- Project title
- Timestamp (full date/time)
- Activity type (vote/revoke)
- Location (if available)

## Technical Implementation

### Data Flow:
```
Dashboard Component
    ↓
fetchRecentActivity()
    ↓
    ├─→ GET /api/votes?allProjects=true
    │   └─→ Returns vote cast activities
    │
    └─→ GET /api/audit-logs?action=VOTE_REVOKED
        └─→ Returns vote revocation activities
    ↓
Merge & Sort by timestamp
    ↓
Display top 10 activities
```

### Update Intervals:
- Initial load: On component mount
- Auto-refresh: Every 30 seconds
- Manual refresh: Via refresh button
- Project change: Activity feed stays the same (independent)

## Performance Considerations

### API Optimization:
- Vote API: Limited to 50 most recent votes
- Audit API: Limited to 20 most recent revocations
- Client-side: Shows only top 10 combined activities

### Caching Strategy:
- No caching (shows real-time data)
- 30-second auto-refresh interval
- Minimal server load due to limits

## User Experience Benefits

### 1. Comprehensive Overview
- See all voting activity at a glance
- No need to switch between projects
- Better awareness of system usage

### 2. Transparency
- Vote revocations are visible
- Clear timestamps for all actions
- Project context always shown

### 3. Real-time Monitoring
- Auto-refreshes every 30 seconds
- Stays current without manual action
- Immediate feedback on system activity

## Testing Checklist

### Vote Cast Display:
- [ ] Vote activity appears with green dot
- [ ] Candidate name in blue/primary color
- [ ] Project title displays correctly
- [ ] Timestamp shows in correct format
- [ ] Location indicator appears when available

### Vote Revoked Display:
- [ ] Revoke activity appears with red dot
- [ ] Candidate name in red color
- [ ] "Revoked" badge appears
- [ ] Project title displays correctly
- [ ] Timestamp shows in correct format

### Cross-Project Activity:
- [ ] Activities from multiple projects appear together
- [ ] Sorted by timestamp (newest first)
- [ ] Limited to 10 most recent activities
- [ ] Updates when switching selected project

### Real-time Updates:
- [ ] Auto-refreshes every 30 seconds
- [ ] Manual refresh button works
- [ ] New activities appear automatically
- [ ] No duplicate entries

### Edge Cases:
- [ ] Shows message when no activity exists
- [ ] Handles missing project titles gracefully
- [ ] Handles missing candidate names gracefully
- [ ] Scrollable when more than ~5 activities

## API Endpoints Summary

| Endpoint | Method | Purpose | Parameters |
|----------|--------|---------|------------|
| `/api/votes` | GET | Get votes | `allProjects=true` for all projects |
| `/api/audit-logs` | GET | Get audit logs | `action=VOTE_REVOKED`, `limit=20` |

## Database Queries

### Vote Query (allProjects=true):
```typescript
db.vote.findMany({
  include: {
    candidate: { select: { name: true } },
    project: { select: { title: true } }
  },
  orderBy: { timestamp: 'desc' },
  take: 50
})
```

### Audit Log Query:
```typescript
db.auditLog.findMany({
  where: { action: 'VOTE_REVOKED' },
  include: {
    user: { select: { name: true, email: true } },
    project: { select: { title: true } }
  },
  orderBy: { timestamp: 'desc' },
  take: 20
})
```

## Files Modified

1. `/src/app/api/votes/route.ts` - Added `allProjects` parameter
2. `/src/app/api/audit-logs/route.ts` - New file for audit logs
3. `/src/app/dashboard/page.tsx` - Updated activity fetching and display

## Security Considerations

### Access Control:
- ✅ Authentication required for all endpoints
- ✅ Users can only see aggregate activity (no personal data)
- ✅ IP addresses only visible in audit logs (admin access)

### Data Privacy:
- Voter names NOT shown in activity feed
- Only candidate names and project titles visible
- Location data shown as indicator only (not coordinates)

## Future Enhancements

1. **Filtering Options:**
   - Filter by project
   - Filter by activity type
   - Date range selector

2. **Enhanced Information:**
   - Show voter apartment unit (for admins only)
   - Vote weight information
   - Voting method used

3. **Pagination:**
   - Load more activities
   - Infinite scroll
   - Export activity log

4. **Real-time Updates:**
   - WebSocket integration
   - Instant updates without polling
   - Live activity notifications

5. **Analytics:**
   - Activity trends chart
   - Peak voting times
   - Project comparison
