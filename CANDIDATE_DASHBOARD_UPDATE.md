# Candidate Dashboard Update

## Overview
The candidate dashboard has been completely redesigned to provide a comprehensive campaign management interface with real-time voting statistics and profile editing capabilities.

## Features Implemented

### 1. Project Selection
- Dropdown selector to choose between multiple voting projects assigned to the candidate
- Only shows projects where the candidate has been added by an administrator
- Automatically loads the first available project on page load

### 2. Real-Time Voting Statistics
- **Total Votes**: Shows current vote count with 24-hour change indicator
- **Current Position**: Displays candidate's ranking among all candidates (e.g., #2 of 5 candidates)
- **Time Remaining**: Live countdown timer showing days, hours, minutes, and seconds until voting ends
- **Vote Share**: Progress bar showing percentage of total votes received
- Statistics automatically refresh every 30 seconds

### 3. Profile Picture Upload
- Support for profile picture via URL
- Preview of current profile picture
- Fallback placeholder if image fails to load
- Compatible with image hosting services (Imgur, Unsplash, Cloudinary, etc.)

### 4. Campaign Information Editing
All editable directly from the dashboard:
- **Campaign Name / Candidate Name**: Display name for voters
- **Vision Statement**: Candidate's vision for the community
- **Mission Statement**: Key missions and goals
- **Why Choose Me**: Explanation of candidate's qualifications

### 5. Social Media Links (Optional)
Support for multiple social media platforms:
- Facebook
- Twitter
- Instagram
- LinkedIn
- Personal Website

All fields are optional and stored as JSON in the database.

### 6. Team Members
- Dynamic list of campaign team members
- Add/remove team members as needed
- Format: "Name - Role" (e.g., "John Doe - Campaign Manager")

### 7. Save & Preview
- **Save Changes**: Updates all profile information with single click
- **Preview Public Profile**: Link to view how profile appears to voters
- Changes saved with audit logging

## API Endpoints Created

### 1. GET `/api/candidates/projects`
Returns all voting projects where the current user is a candidate.

**Response:**
```json
[
  {
    "id": "candidate_id",
    "userId": "user_id",
    "projectId": "project_id",
    "name": "Candidate Name",
    "photo": "https://...",
    "vision": "...",
    "mission": "...",
    "reason": "...",
    "socialMedia": "{...}",
    "project": {
      "id": "project_id",
      "title": "Project Title",
      "status": "ACTIVE",
      "startDate": "...",
      "endDate": "...",
      ...
    },
    "_count": {
      "votes": 127
    }
  }
]
```

### 2. GET `/api/candidates/stats/[projectId]`
Returns live voting statistics for a candidate in a specific project.

**Response:**
```json
{
  "candidateId": "...",
  "totalVotes": 127,
  "weightedVotes": 450.5,
  "position": 2,
  "totalCandidates": 5,
  "votePercentage": 35.8,
  "recentVotes": 12,
  "leaderboard": [
    {
      "id": "...",
      "name": "...",
      "voteCount": 150,
      "weightedVoteCount": 525.0
    },
    ...
  ]
}
```

### 3. PATCH `/api/candidates/[id]`
Updated to support all new fields including:
- `name`
- `photo`
- `socialMedia`
- `vision`
- `mission`
- `reason`
- `teamMembers`

## Database Schema Changes

### Candidate Model
Added new field:
```prisma
model Candidate {
  ...
  socialMedia String?  // JSON object with social media links
  ...
}
```

The `socialMedia` field stores a JSON object with the following structure:
```json
{
  "facebook": "https://facebook.com/...",
  "twitter": "https://twitter.com/...",
  "instagram": "https://instagram.com/...",
  "linkedin": "https://linkedin.com/in/...",
  "website": "https://yourwebsite.com"
}
```

## User Experience

### Workflow
1. Candidate logs in and navigates to dashboard
2. If multiple projects exist, selects desired project from dropdown
3. Views real-time voting statistics at a glance
4. Edits profile information, adds photos, social media links
5. Manages team member list
6. Saves changes with one click
7. Previews public profile to see how voters will see it

### Real-Time Updates
- Vote counts update every 30 seconds automatically
- Time remaining updates every second for precise countdown
- Position and ranking calculated dynamically based on current votes

### Responsive Design
- Mobile-friendly layout with responsive grid
- Touch-optimized inputs and buttons
- Adaptive spacing for different screen sizes

## Security & Privacy

### Access Control
- Only authenticated candidates can access their dashboard
- Candidates can only edit their own profiles
- Project selection limited to projects where user is assigned as candidate
- All updates logged in audit trail

### Data Validation
- Session validation on all API requests
- Ownership verification before allowing updates
- Empty team member entries filtered out before saving
- JSON fields properly stringified before database storage

## Technical Details

### State Management
- React hooks for local state management
- Multiple `useEffect` hooks for different update intervals
- Automatic data fetching on project selection
- Form data synchronized with selected project

### Performance
- Lazy loading of statistics (only for selected project)
- Efficient re-renders with proper dependency arrays
- Debounced input updates
- Progressive loading with skeleton screens

### Error Handling
- Graceful fallback for missing data
- Image loading error handling
- API error messages displayed to user
- Console logging for debugging

## Future Enhancements

Potential improvements:
1. Image upload functionality (vs URL only)
2. Rich text editor for mission/vision statements
3. Campaign analytics dashboard with charts
4. Voter engagement metrics
5. Campaign event calendar
6. Direct messaging with voters
7. Poll creation and management
8. Campaign document library

## Testing

### Test Scenario
1. Login as Linda Martinez (linda.martinez@example.com / password123)
2. Navigate to candidate dashboard
3. Select a voting project
4. Verify statistics display correctly
5. Edit profile information
6. Add social media links
7. Manage team members
8. Save changes
9. Preview public profile

### Expected Behavior
- All fields save and persist
- Statistics update automatically
- Countdown timer shows correct time remaining
- Position reflects actual vote count ranking
- Preview link works and shows updated information

## Notes

- The countdown timer is linked to the `endDate` of the voting project
- Position is calculated by comparing weighted vote counts across all candidates
- Social media links are optional - candidates can leave them blank
- Team members list always has at least one empty field for adding new members
- Profile picture must be a valid URL - consider integrating file upload in future

## Migration Script

The `add-social-media-column.ts` script was created to add the `socialMedia` column to existing databases:
```bash
DATABASE_URL="file:./dev.db" npx tsx scripts/add-social-media-column.ts
```

This adds the column without losing existing data.
