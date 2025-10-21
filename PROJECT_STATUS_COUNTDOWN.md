# Voting Project Status & Countdown Feature

## Overview
Added comprehensive project status information to the dashboard, showing whether a voting project has ended, is active, or hasn't started yet, with real-time countdown timers.

## Features Implemented

### 1. Project Status States
Three distinct states with visual indicators:

| Status | Description | When | Color |
|--------|-------------|------|-------|
| **Not Started** | Voting hasn't begun | Current time < Start time | Yellow |
| **Active Now** | Voting is currently open | Start time ≤ Current time ≤ End time | Green |
| **Ended** | Voting has closed | Current time > End time OR isActive = false | Gray |

### 2. Real-time Countdown Timer
- **For "Not Started" projects:** Shows time until voting begins
- **For "Active" projects:** Shows time remaining until voting ends
- **For "Ended" projects:** Shows "Voting has ended"
- **Update frequency:** Every 1 second (real-time)

### 3. Countdown Format
Adaptive time display based on remaining duration:

```
> 1 day:     "5d 12h 30m"
> 1 hour:    "3h 45m 20s"
> 1 minute:  "45m 30s"
< 1 minute:  "30s"
```

## UI Components Added

### Project Status Card
A prominent card displaying comprehensive project information:

```
┌────────────────────────────────────────────────────┐
│ Project Title                      [Active Now] ✓  │
│ Description of the voting project                  │
│                                                    │
│ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐│
│ │ 🕐 Start Date│ │ 🕐 End Date  │ │ ⚡ Status   ││
│ │ Oct 21, 2025 │ │ Oct 28, 2025 │ │ Ends in     ││
│ │ 9:00 AM      │ │ 5:00 PM      │ │ 6d 8h 30m   ││
│ └──────────────┘ └──────────────┘ └─────────────┘│
│                                                    │
│ 👥 5 Candidates    📊 120 Votes Cast   [Live] ⚡   │
└────────────────────────────────────────────────────┘
```

### Visual Elements:

#### Status Badges:
- **Not Started**: Yellow badge with "Not Started" text
- **Active Now**: Green badge with "Active Now" text (animated pulse)
- **Ended**: Gray badge with "Ended" text

#### Information Sections:
1. **Start Date** - Blue clock icon
2. **End Date** - Red clock icon
3. **Countdown** - Primary color with highlighted background
4. **Footer Stats** - Candidate count and vote count

## Technical Implementation

### New State Variables:
```typescript
const [countdown, setCountdown] = useState<string>('')
```

### Helper Functions:

#### 1. `getProjectStatus(project)`
Determines current project status:
```typescript
const getProjectStatus = (project: VotingProject) => {
  const now = new Date()
  const start = new Date(project.startDate)
  const end = new Date(project.endDate)

  if (now < start) return 'NOT_STARTED'
  else if (now >= start && now <= end && project.isActive) return 'ACTIVE'
  else return 'ENDED'
}
```

#### 2. `getStatusBadgeColor(status)`
Returns Tailwind CSS classes for status badge:
```typescript
'NOT_STARTED' → 'bg-yellow-100 text-yellow-800 border-yellow-300'
'ACTIVE'      → 'bg-green-100 text-green-800 border-green-300'
'ENDED'       → 'bg-gray-100 text-gray-800 border-gray-300'
```

#### 3. `getStatusText(status)`
Human-readable status text:
```typescript
'NOT_STARTED' → 'Not Started'
'ACTIVE'      → 'Active Now'
'ENDED'       → 'Ended'
```

#### 4. `formatCountdown(milliseconds)`
Converts milliseconds to human-readable format:
```typescript
const formatCountdown = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`
  else if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  else if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  else return `${seconds}s`
}
```

#### 5. `updateCountdown()`
Updates countdown text based on project status:
```typescript
const updateCountdown = () => {
  const project = projects.find(p => p.id === selectedProject)
  const status = getProjectStatus(project)

  if (status === 'NOT_STARTED') {
    const timeUntilStart = start.getTime() - now.getTime()
    setCountdown(`Starts in ${formatCountdown(timeUntilStart)}`)
  } else if (status === 'ACTIVE') {
    const timeUntilEnd = end.getTime() - now.getTime()
    setCountdown(`Ends in ${formatCountdown(timeUntilEnd)}`)
  } else {
    setCountdown('Voting has ended')
  }
}
```

### Real-time Updates:

#### Countdown Interval:
```typescript
useEffect(() => {
  if (user && selectedProject) {
    const countdownInterval = setInterval(() => {
      updateCountdown()
    }, 1000) // Update every second

    return () => clearInterval(countdownInterval)
  }
}, [user, selectedProject, projects])
```

## User Experience

### Status Indicators:

#### Not Started (Upcoming):
- Yellow badge: "Not Started"
- Countdown: "Starts in 2d 5h 30m"
- Footer badge: "Upcoming"
- No voting buttons shown

#### Active:
- Green badge: "Active Now" (with pulse animation)
- Countdown: "Ends in 6d 8h 15m"
- Footer badge: "Live Voting" (animated)
- Voting buttons/status shown

#### Ended:
- Gray badge: "Ended"
- Countdown: "Voting has ended"
- Footer badge: "Closed"
- No voting buttons, results visible

### Information Hierarchy:
1. **Project Title & Status** - Large, prominent at top
2. **Description** - Context about the voting project
3. **Date Information** - Start and end times
4. **Countdown** - Highlighted, updates in real-time
5. **Statistics** - Quick metrics (candidates, votes)
6. **Status Badge** - Additional visual indicator

## Visual Design

### Color Coding:
- **Yellow Theme**: Not started (warning/future)
- **Green Theme**: Active (success/live)
- **Gray Theme**: Ended (neutral/past)
- **Blue**: Informational elements
- **Primary**: Countdown and active elements

### Animations:
- **Pulse animation** on "Active Now" badge
- **Pulse animation** on "Live Voting" badge
- **Real-time countdown** updates every second

### Layout:
- **Responsive grid**: 3 columns on desktop, stacks on mobile
- **Card-based design**: Consistent with dashboard theme
- **Icon indicators**: Visual cues for different data types

## Testing Checklist

### Status Display:
- [ ] "Not Started" status shows for future projects
- [ ] "Active Now" status shows for current projects
- [ ] "Ended" status shows for past projects
- [ ] Badge colors match status correctly

### Countdown Timer:
- [ ] Countdown updates every second
- [ ] Format changes based on time remaining (days/hours/minutes)
- [ ] Shows "Starts in..." for not started projects
- [ ] Shows "Ends in..." for active projects
- [ ] Shows "Voting has ended" for ended projects

### Visual Elements:
- [ ] Status badge appears with correct color
- [ ] Pulse animation on active status
- [ ] Clock icons display correctly
- [ ] Activity icon for countdown
- [ ] Footer badges appear based on status

### Date Display:
- [ ] Start date formats correctly
- [ ] End date formats correctly
- [ ] Timezone displays correctly
- [ ] Date/time readable format

### Responsive Design:
- [ ] Grid stacks properly on mobile
- [ ] Text remains readable on small screens
- [ ] Icons scale appropriately
- [ ] Badge positions correctly

## Integration Points

### Works With:
- ✅ Project selection dropdown
- ✅ Vote casting section (shows/hides based on status)
- ✅ Vote status display
- ✅ Dashboard statistics
- ✅ Recent activity feed

### Automatic Updates:
- Real-time countdown (1 second intervals)
- Refresh on project change
- Updates with dashboard refresh

## Performance Considerations

### Optimization:
- Single interval for countdown (1 per second)
- Efficient date calculations
- Minimal re-renders
- Cleanup on component unmount

### Resource Usage:
- **Countdown interval**: 1 timer per dashboard instance
- **Update frequency**: 1 Hz (once per second)
- **Calculation complexity**: O(1) per update

## Files Modified

1. `/src/app/dashboard/page.tsx`:
   - Added countdown state
   - Added status calculation functions
   - Added countdown formatting functions
   - Added countdown update effect
   - Added project status card UI

## Sample Display States

### Example 1: Not Started Project
```
Project Title: 2026 Board Election
Status Badge: [Not Started] (Yellow)

Start Date: Dec 1, 2025 9:00 AM
End Date: Dec 8, 2025 5:00 PM
Status: Starts in 41d 12h 45m

5 Candidates | 0 Votes Cast | [Upcoming]
```

### Example 2: Active Project
```
Project Title: 2025 HOA Election
Status Badge: [Active Now] (Green, pulsing)

Start Date: Oct 20, 2025 9:00 AM
End Date: Oct 27, 2025 5:00 PM
Status: Ends in 5d 8h 23m

8 Candidates | 145 Votes Cast | [Live Voting] (pulsing)
```

### Example 3: Ended Project
```
Project Title: 2024 Budget Vote
Status Badge: [Ended] (Gray)

Start Date: Jan 15, 2024 9:00 AM
End Date: Jan 22, 2024 5:00 PM
Status: Voting has ended

4 Candidates | 320 Votes Cast | [Closed]
```

## Future Enhancements

1. **Progress Bar**: Visual representation of time elapsed/remaining
2. **Notification**: Alert when countdown reaches critical thresholds
3. **Time Zone**: Display in user's local timezone
4. **Calendar Integration**: Add to calendar buttons
5. **Historical View**: Archive of past project countdowns
6. **Email Reminders**: Send notifications at countdown milestones
7. **Custom Alerts**: User-defined reminder times
8. **Mobile Notifications**: Push notifications for countdown events
