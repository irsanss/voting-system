import { db } from '@/lib/db'
import { createUser, hashPassword } from '@/lib/auth'
import { UserRole, User } from '@prisma/client'

export async function seedDatabase() {
  try {
    console.log('Seeding database...')

    // Create sample users
    const sampleUsers = [
      {
        email: 'admin@example.com',
        name: 'Admin User',
        password: 'Admin123!',
        role: UserRole.SUPERADMIN,
        apartmentUnit: 'A-900',
        apartmentSize: 50,
      },
      {
        email: 'voter1@example.com',
        name: 'John Resident',
        password: 'Voter123!',
        role: UserRole.VOTER,
        apartmentUnit: 'A-101',
        apartmentSize: 85.5,
      },
      {
        email: 'voter2@example.com',
        name: 'Jane Resident',
        password: 'Voter123!',
        role: UserRole.VOTER,
        apartmentUnit: 'B-205',
        apartmentSize: 120.0,
      },
      {
        email: 'candidate1@example.com',
        name: 'Alice Candidate',
        password: 'Candidate123!',
        role: UserRole.CANDIDATE,
        apartmentUnit: 'C-301',
        apartmentSize: 95.0,
      },
      {
        email: 'candidate2@example.com',
        name: 'Bob Candidate',
        password: 'Candidate123!',
        role: UserRole.CANDIDATE,
        apartmentUnit: 'D-402',
        apartmentSize: 110.0,
      },
      {
        email: 'committee@example.com',
        name: 'Committee Member',
        password: 'Committee123!',
        role: UserRole.COMMITTEE,
        apartmentUnit: 'E-700',
        apartmentSize: 60,
      },
      {
        email: 'auditor@example.com',
        name: 'Auditor User',
        password: 'Auditor123!',
        role: UserRole.AUDITOR,
        apartmentUnit: 'F-800',
        apartmentSize: 40,
      },
      {
        email: 'supervisor@example.com',
        name: 'Supervisor User',
        password: 'Supervisor123!',
        role: UserRole.SUPERVISOR,
        apartmentUnit: 'G-910',
        apartmentSize: 45,
      },
    ]

    const createdUsers: User[] = []
    for (const userData of sampleUsers) {
      try {
        const user = await createUser(userData)
        createdUsers.push(user)
        console.log(`Created user: ${user.email}`)
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`User ${userData.email} already exists`)
        } else {
          console.error(`Error creating user ${userData.email}:`, error)
        }
      }
    }

    // Create a sample voting project
    const existingProject = await db.votingProject.findFirst({
      where: { title: 'Apartment Head Election 2024' }
    })

    let project
    if (existingProject) {
      project = existingProject
      console.log(`Project already exists: ${project.title}`)
    } else {
      project = await db.votingProject.create({
        data: {
          title: 'Apartment Head Election 2024',
          description: 'Annual election for the apartment head of residence',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          isActive: true,
        },
      })
      console.log(`Created project: ${project.title}`)
    }

    // Create candidates
    const candidateUsers = createdUsers.filter(u => u.role === UserRole.CANDIDATE)
    for (const candidateUser of candidateUsers) {
      try {
        const existingCandidate = await db.candidate.findFirst({
          where: { userId: candidateUser.id }
        })

        if (existingCandidate) {
          console.log(`Candidate already exists for user: ${candidateUser.email}`)
        } else {
          const candidate = await db.candidate.create({
            data: {
              userId: candidateUser.id,
              projectId: project.id,
              name: candidateUser.name || 'Unknown Candidate',
              vision: `To create a better living environment for all residents through modern management and community engagement.`,
              mission: `1. Improve facility maintenance\n2. Enhance security measures\n3. Organize community events\n4. Promote sustainable practices`,
              reason: `With over 5 years of experience in property management and a deep understanding of our community's needs, I am committed to serving all residents with dedication and transparency.`,
              teamMembers: JSON.stringify([
                'Sarah Johnson - Treasurer',
                'Mike Chen - Security Coordinator',
                'Lisa Park - Events Organizer'
              ]),
              images: JSON.stringify([
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
              ]),
              isActive: true,
            },
          })
          console.log(`Created candidate: ${candidate.name}`)
        }
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`Candidate for user ${candidateUser.email} already exists`)
        } else {
          console.error(`Error creating candidate for ${candidateUser.email}:`, error)
        }
      }
    }

    console.log('Database seeding completed!')

    // Print login credentials
    console.log('\n=== LOGIN CREDENTIALS ===')
    console.log('Superadmin: admin@example.com / Admin123!')
    console.log('Voter: voter1@example.com / Voter123!')
    console.log('Candidate: candidate1@example.com / Candidate123!')
    console.log('Committee: committee@example.com / Committee123!')
    console.log('Auditor: auditor@example.com / Auditor123!')
    console.log('Supervisor: supervisor@example.com / Supervisor123!')
    console.log('========================\n')

  } catch (error) {
    console.error('Error seeding database:', error)
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
}