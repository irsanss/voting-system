# Role-Based Dashboards Visual Mockup

## Role Routing Structure

```
SUPERADMIN / COMMITTEE → /admin/dashboard (already implemented)
VOTER                  → /dashboard (existing, needs header update)
CANDIDATE              → /candidate/dashboard (new)
AUDITOR                → /auditor/dashboard (new)
```

---

## 1. VOTER DASHBOARD (`/dashboard`)

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│  Voting System              [Home] [Projects]    [🌙] [@] [Avatar ▼] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Welcome, John Resident! 👋                                          │
│  Your Apartment: A-101 (85.5 m²)                                    │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  📊 Active Voting Projects                                    │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                                │   │
│  │  🗳️  Apartment Head Election 2024                             │   │
│  │      Status: Active • Ends: Dec 31, 2024                      │   │
│  │      Your Vote: ✅ Cast • 3 Candidates                        │   │
│  │      [View Results]                                           │   │
│  │                                                                │   │
│  │  🗳️  Budget Approval 2025                                      │   │
│  │      Status: Upcoming • Starts: Jan 1, 2025                   │   │
│  │      Your Vote: ⏳ Pending • 2 Options                        │   │
│  │      [Vote Now]                                               │   │
│  │                                                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐         │
│  │ 📈 Your Stats  │ │ 🏆 Your Weight │ │ 📅 Next Vote   │         │
│  │                │ │                │ │                │         │
│  │   5 Votes      │ │   85.5 m²      │ │   Jan 1, 2025  │         │
│  │   Cast         │ │   Weight       │ │                │         │
│  └────────────────┘ └────────────────┘ └────────────────┘         │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  📜 Recent Voting Activity                                    │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  • Dec 15: Voted in "Apartment Head Election 2024"           │   │
│  │  • Nov 30: Voted in "Pool Renovation"                        │   │
│  │  • Oct 20: Voted in "Security Upgrade"                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Features
- **View active voting projects** with real-time status
- **Cast votes** in ongoing elections
- **View results** of completed elections (if allowed)
- **Track voting history** and participation
- **See voting weight** based on apartment size
- **Profile access** via dropdown

---

## 2. CANDIDATE DASHBOARD (`/candidate/dashboard`)

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│  Voting System    [Dashboard] [My Campaigns] [Profile]  [🌙] [Avatar▼]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  🎯 Candidate Dashboard - Alice Candidate                            │
│  Status: Active Candidate • Apartment: C-301                         │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  📊 My Campaign Performance                                   │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                                │   │
│  │  Election: Apartment Head Election 2024                       │   │
│  │                                                                │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │   │
│  │  │ 📈 Votes    │ │ 📊 Position │ │ ⏱️ Time Left │            │   │
│  │  │             │ │             │ │             │            │   │
│  │  │   127       │ │    #2       │ │   15 days   │            │   │
│  │  │   votes     │ │   of 3      │ │             │            │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘            │   │
│  │                                                                │   │
│  │  Vote Distribution:                                           │   │
│  │  ████████████████████████░░░░░░░░░░ 40%                      │   │
│  │                                                                │   │
│  │  [View Detailed Analytics]                                    │   │
│  │                                                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  📝 My Campaign Profile                                       │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                                │   │
│  │  Vision: "Creating a safer and more sustainable community"   │   │
│  │  Status: ✅ Profile Complete                                  │   │
│  │                                                                │   │
│  │  📸 Photos: 3 uploaded                                        │   │
│  │  🎥 Videos: 1 uploaded                                        │   │
│  │  👥 Team Members: 2 listed                                    │   │
│  │                                                                │   │
│  │  [Edit Campaign Profile]                                      │   │
│  │                                                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  🗳️ My Active Campaigns                                       │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  • Apartment Head Election 2024 (Active)                     │   │
│  │  • Committee Member Election 2024 (Ended - Won! 🎉)          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Features
- **Real-time vote tracking** for their campaigns
- **Campaign profile management** (vision, mission, photos, videos)
- **Performance analytics** (vote count, position, trends)
- **Campaign history** showing past and current elections
- **Voter as well** - can vote in other elections

---

## 3. AUDITOR DASHBOARD (`/auditor/dashboard`)

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│  Voting System  [Dashboard] [Audit Logs] [Reports]  [🌙] [Avatar ▼] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  🔍 Auditor Dashboard - Auditor User                                 │
│  Access Level: Full Audit Rights                                     │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  📊 System Overview                                           │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                                │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │   │
│  │  │ 🗳️ Projects   │ │ 👥 Total     │ │ 📝 Audit     │         │   │
│  │  │              │ │    Users     │ │    Logs      │         │   │
│  │  │      5       │ │     250      │ │    1,247     │         │   │
│  │  │   Active     │ │              │ │   Today      │         │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘         │   │
│  │                                                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  🔐 Security Events (Last 24 Hours)                           │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                                │   │
│  │  🔴 CRITICAL: 0 events                                        │   │
│  │  🟠 HIGH: 2 events                                            │   │
│  │  🟡 MEDIUM: 15 events                                         │   │
│  │  🟢 LOW: 234 events                                           │   │
│  │                                                                │   │
│  │  Recent Events:                                               │   │
│  │  • 14:23 - Multiple login attempts from IP 192.168.1.55      │   │
│  │  • 13:45 - User role changed: voter1@example.com             │   │
│  │  • 12:30 - Vote cast in "Election 2024" by user #123         │   │
│  │                                                                │   │
│  │  [View All Security Logs]                                     │   │
│  │                                                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  📋 Recent Audit Activities                                   │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                                │   │
│  │  ✅ Dec 20: Election "Head 2024" - Verified ✓                │   │
│  │  ⏳ Dec 19: Vote integrity check - In Progress                │   │
│  │  ✅ Dec 18: User access audit - Completed                     │   │
│  │  ✅ Dec 17: System log review - No issues found              │   │
│  │                                                                │   │
│  │  [Generate New Report] [Export Logs]                          │   │
│  │                                                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  🗳️ Voting Projects Requiring Audit                           │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  1. Apartment Head Election 2024 (Ends: Dec 31)              │   │
│  │     Status: Active • 247 votes cast                           │   │
│  │     [Monitor] [Generate Report]                               │   │
│  │                                                                │   │
│  │  2. Budget Approval 2025 (Starts: Jan 1)                     │   │
│  │     Status: Upcoming • Awaiting approval                      │   │
│  │     [Review Setup]                                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Features
- **Security monitoring** with real-time alerts
- **Audit log access** (view all system activities)
- **Vote integrity verification**
- **Report generation** for compliance
- **User activity tracking**
- **System health monitoring**
- **Read-only access** to all data (cannot modify)

---

## 4. COMMITTEE DASHBOARD (`/admin/dashboard`)

**(Already implemented - same as SUPERADMIN)**

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│  Voting System  [Dashboard] [Users] [Projects] [Reports]  [🌙] [▼]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  🛡️ Admin Dashboard - Committee Member                               │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Quick Actions                                                │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                                │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │   │
│  │  │ 👥 Manage    │ │ 🎯 Manage    │ │ 🗳️ Manage    │         │   │
│  │  │    Users     │ │    Candidates│ │    Projects  │         │   │
│  │  │              │ │              │ │              │         │   │
│  │  │   [Go →]     │ │   [Go →]     │ │   [Go →]     │         │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘         │   │
│  │                                                                │   │
│  │  ┌──────────────┐ ┌──────────────┐                           │   │
│  │  │ 📊 Generate  │ │ 📈 System    │                           │   │
│  │  │    Reports   │ │    Analytics │                           │   │
│  │  │              │ │              │                           │   │
│  │  │   [Go →]     │ │   [Go →]     │                           │   │
│  │  └──────────────┘ └──────────────┘                           │   │
│  │                                                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Features
- **Full user management** (create, edit, deactivate)
- **Candidate approval** and management
- **Project creation** and management
- **Report generation**
- **System analytics**
- **All admin privileges**

---

## Common Header for All Roles

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  Voting System    [Navigation Links]           [🌙] [Avatar ▼]      │
│                                                                       │
│  Avatar Dropdown Menu:                                               │
│  ┌──────────────────────┐                                           │
│  │ John Resident         │                                           │
│  │ voter1@example.com    │                                           │
│  │ [VOTER]               │ ← Role Badge                              │
│  ├──────────────────────┤                                           │
│  │ 📊 Dashboard          │                                           │
│  │ 👤 Profile            │ → Goes to /profile                        │
│  ├──────────────────────┤                                           │
│  │ 🚪 Logout             │ → Goes to / (homepage)                    │
│  └──────────────────────┘                                           │
│                                                                       │
│  Theme Toggle (🌙):                                                  │
│  ┌──────────────────────┐                                           │
│  │ ☀️  Light             │                                           │
│  │ 🌙 Dark               │                                           │
│  │ 💻 System             │                                           │
│  └──────────────────────┘                                           │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## User Profile Page (`/profile`) - Universal for All Roles

```
┌─────────────────────────────────────────────────────────────────────┐
│  Voting System                                      [🌙] [Avatar ▼]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ← Back to Dashboard                                                 │
│                                                                       │
│  👤 My Profile                                                        │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Personal Information                                         │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                                │   │
│  │  Full Name:      [John Resident                          ]   │   │
│  │  Email:          voter1@example.com (cannot change)          │   │
│  │  Role:           VOTER                                        │   │
│  │  Apartment Unit: [A-101                                   ]   │   │
│  │  Apartment Size: [85.5                                    ] m²│   │
│  │  Language:       [English ▼]                                 │   │
│  │  Member Since:   January 15, 2024                            │   │
│  │                                                                │   │
│  │  [Save Changes]                                               │   │
│  │                                                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  🔒 Security Settings                                         │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                                │   │
│  │  Change Password:                                             │   │
│  │  Current Password:  [••••••••••••                        ]   │   │
│  │  New Password:      [••••••••••••                        ]   │   │
│  │  Confirm Password:  [••••••••••••                        ]   │   │
│  │                                                                │   │
│  │  [Update Password]                                            │   │
│  │                                                                │   │
│  │  Last Login: December 20, 2024 at 2:30 PM                    │   │
│  │  IP Address: 192.168.1.100                                    │   │
│  │                                                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  📊 My Activity Summary                                       │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  Total Votes Cast: 5                                          │   │
│  │  Projects Participated: 5                                     │   │
│  │  Account Status: Active ✓                                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Routing Summary

| Role        | Login Redirect         | Can Access                                    |
|-------------|------------------------|-----------------------------------------------|
| SUPERADMIN  | `/admin/dashboard`     | All admin pages, plus all other dashboards    |
| COMMITTEE   | `/admin/dashboard`     | All admin pages, plus all other dashboards    |
| VOTER       | `/dashboard`           | Voter dashboard, profile, projects, voting    |
| CANDIDATE   | `/candidate/dashboard` | Candidate dashboard, profile, campaign mgmt   |
| AUDITOR     | `/auditor/dashboard`   | Audit logs, reports, read-only system access  |

All roles can access:
- `/profile` - Their own profile page
- `/` - Homepage (after logout)
- Theme toggle (light/dark/system)
- Logout functionality

---

## Next Steps

1. ✅ Create visual mockup (this document)
2. ⏳ Update login redirect logic for all roles
3. ⏳ Create role-specific headers (VoterHeader, CandidateHeader, AuditorHeader)
4. ⏳ Implement Candidate dashboard
5. ⏳ Implement Auditor dashboard
6. ⏳ Update existing Voter dashboard with new header
7. ⏳ Create universal Profile page
8. ⏳ Test all role routing and permissions
