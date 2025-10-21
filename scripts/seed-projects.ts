import { PrismaClient, Candidate } from '@prisma/client'

const prisma = new PrismaClient()

async function seedProjects() {
    try {
        console.log('🌱 Seeding voting projects...\n')

        // Get existing users to assign as candidates
        const users = await prisma.user.findMany({
            where: {
                role: { in: ['CANDIDATE', 'VOTER'] }
            }
        })

        let candidateUsers = users.filter(u => u.role === 'CANDIDATE')
        const voterUsers = users.filter(u => u.role === 'VOTER')

        // Define the specific candidate names we want to match
        const candidateEmails = [
            'michael.chen@example.com',
            'sarah.martinez@example.com',
            'james.wilson@example.com',
            'priya.sharma@example.com',
            'robert.taylor@example.com',
            'linda.martinez@example.com',
            'anthony.lee@example.com',
            'daniel.kim@example.com',
            'rebecca.foster@example.com'
        ]

        // Create additional candidate users if needed (we need at least 9 candidates total)
        const candidatesNeeded = 9 - candidateUsers.length
        if (candidatesNeeded > 0) {
            console.log(`Creating ${candidatesNeeded} additional candidate users...\n`)
            const { hashPassword } = await import('../src/lib/auth')

            for (let i = 0; i < candidatesNeeded; i++) {
                const candidateNum = candidateUsers.length + i + 1
                const hashedPassword = await hashPassword('Candidate123!')

                const newCandidate = await prisma.user.create({
                    data: {
                        email: `candidate${candidateNum}@example.com`,
                        name: `Candidate ${candidateNum}`,
                        password: hashedPassword,
                        role: 'CANDIDATE',
                        apartmentUnit: `Unit-${candidateNum}00`,
                        apartmentSize: 95.0,
                    }
                })
                candidateUsers.push(newCandidate)
                console.log(`  ✅ Created candidate user: candidate${candidateNum}@example.com`)
            }
            console.log()
        }

        // PROJECT 1: UPCOMING - 2026 Head Apartments Election
        console.log('📅 Creating UPCOMING project: 2026 Head Apartments Election')

        // Check if project exists
        let project2026 = await prisma.votingProject.findFirst({
            where: { title: '2026 Head Apartments Election' }
        })

        if (!project2026) {
            project2026 = await prisma.votingProject.create({
                data: {
                    title: '2026 Head Apartments Election',
                    description: 'Annual election for the apartment head of residence for the year 2026. All residents are eligible to vote.',
                    votingType: 'HEAD_OF_APARTMENT',
                    votingMethod: 'ONE_PERSON_ONE_VOTE',
                    startDate: new Date('2025-12-05T00:00:00Z'),
                    endDate: new Date('2025-12-19T23:59:59Z'),
                    isActive: false,
                    isPublished: true,
                    status: 'UPCOMING',
                }
            })
        }
        console.log(`  Project ID: ${project2026.id}`)

        // Create 4 candidates for 2026
        const candidates2026 = [
            {
                name: 'Michael Chen',
                vision: 'Building a sustainable and tech-forward community for the future',
                mission: '1. Implement smart home technology\n2. Create green spaces and rooftop gardens\n3. Establish community co-working spaces\n4. Enhance digital security systems',
                reason: 'With 10 years of experience in property management and a background in sustainable urban development, I am committed to transforming our apartment complex into a model community.',
                teamMembers: JSON.stringify([
                    'Jennifer Liu - Operations Manager',
                    'David Park - Technology Coordinator',
                    'Emma Watson - Community Engagement Lead'
                ]),
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=600&fit=crop'
                ]),
                videos: JSON.stringify([
                    'https://example.com/michael-chen-vision.mp4'
                ])
            },
            {
                name: 'Sarah Martinez',
                vision: 'Creating a family-friendly environment with strong community bonds',
                mission: '1. Organize monthly family events and activities\n2. Improve playground and recreational facilities\n3. Establish neighborhood watch program\n4. Create mentorship programs for youth',
                reason: 'As a long-time resident and mother of two, I understand the needs of families and am passionate about building a safe, nurturing community for all ages.',
                teamMembers: JSON.stringify([
                    'Robert Johnson - Security Advisor',
                    'Lisa Kim - Events Coordinator',
                    'Tom Anderson - Facilities Manager'
                ]),
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop'
                ]),
                videos: JSON.stringify([])
            },
            {
                name: 'James Wilson',
                vision: 'Modernizing facilities while preserving affordability and accessibility',
                mission: '1. Negotiate better maintenance contracts\n2. Upgrade elevators and common areas\n3. Implement cost-saving energy solutions\n4. Maintain transparent financial reporting',
                reason: 'With a CPA background and 15 years in building management, I will ensure our funds are used efficiently while improving our living standards.',
                teamMembers: JSON.stringify([
                    'Patricia Brown - Financial Analyst',
                    'Kevin Lee - Maintenance Supervisor',
                    'Angela Davis - Resident Relations'
                ]),
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=600&fit=crop'
                ]),
                videos: JSON.stringify([])
            },
            {
                name: 'Priya Sharma',
                vision: 'Fostering diversity, inclusion, and cultural harmony in our community',
                mission: '1. Organize multicultural festivals and events\n2. Create language exchange programs\n3. Establish community meditation and wellness center\n4. Promote local businesses and artisans',
                reason: 'As someone who values diversity and community spirit, I will work to ensure every resident feels welcomed, heard, and represented in our apartment complex.',
                teamMembers: JSON.stringify([
                    'Carlos Rodriguez - Cultural Events Manager',
                    'Mei Zhang - Communications Director',
                    'Alex Thompson - Wellness Coordinator'
                ]),
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&h=600&fit=crop'
                ]),
                videos: JSON.stringify([])
            }
        ]

        for (let i = 0; i < candidates2026.length; i++) {
            const candidateData = candidates2026[i]
            // Try to find user by matching email, otherwise use index
            const candidateEmail = candidateEmails[i]
            let userId = candidateUsers.find(u => u.email === candidateEmail)?.id || candidateUsers[i]?.id

            if (!userId) {
                console.log(`  ⚠️  No user found for ${candidateData.name}, skipping...`)
                continue
            }

            const existing = await prisma.candidate.findFirst({
                where: {
                    projectId: project2026.id,
                    userId: userId
                }
            })

            if (!existing) {
                await prisma.candidate.create({
                    data: {
                        projectId: project2026.id,
                        userId: userId,
                        ...candidateData,
                        isActive: true,
                    }
                })
                console.log(`  ✅ Created candidate: ${candidateData.name}`)
            } else {
                console.log(`  ⏭️  Candidate already exists: ${candidateData.name}`)
            }
        }

        // PROJECT 2: ACTIVE - 2025 Head Apartments Election
        console.log('\n🗳️  Creating ACTIVE project: 2025 Head Apartments Election')

        let project2025 = await prisma.votingProject.findFirst({
            where: { title: '2025 Head Apartments Election' }
        })

        if (!project2025) {
            project2025 = await prisma.votingProject.create({
                data: {
                    title: '2025 Head Apartments Election',
                    description: 'Current ongoing election for the apartment head of residence for 2025. Vote for your preferred candidate now!',
                    votingType: 'HEAD_OF_APARTMENT',
                    votingMethod: 'ONE_PERSON_ONE_VOTE',
                    startDate: new Date('2024-11-01T00:00:00Z'),
                    endDate: new Date('2025-12-31T23:59:59Z'),
                    isActive: true,
                    isPublished: true,
                    status: 'ACTIVE',
                }
            })
        }
        console.log(`  Project ID: ${project2025.id}`)

        // Create 3 candidates for 2025
        const candidates2025 = [
            {
                name: 'Robert Taylor',
                vision: 'Maintaining excellence in service and resident satisfaction',
                mission: '1. Continue quarterly resident forums\n2. Upgrade internet infrastructure\n3. Improve parking management\n4. Enhance security measures',
                reason: 'Currently serving as interim committee member, I have the experience and commitment to lead our community forward.',
                teamMembers: JSON.stringify([
                    'Nancy White - Assistant Manager',
                    'George Miller - Technical Support',
                    'Helen Garcia - Resident Services'
                ]),
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
                ]),
                videos: JSON.stringify([])
            },
            {
                name: 'Linda Martinez',
                vision: 'Creating a vibrant, connected community through engagement',
                mission: '1. Launch community app for better communication\n2. Create shared workspace and library\n3. Organize monthly social gatherings\n4. Establish recycling and composting programs',
                reason: 'With a background in community development and passion for environmental sustainability, I will bring fresh ideas and energy to our leadership.',
                teamMembers: JSON.stringify([
                    'Steve Johnson - IT Specialist',
                    'Maria Lopez - Event Planner',
                    'Frank Wilson - Green Initiatives Lead'
                ]),
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop'
                ]),
                videos: JSON.stringify([
                    'https://example.com/linda-martinez-campaign.mp4'
                ])
            },
            {
                name: 'Anthony Lee',
                vision: 'Prioritizing safety, maintenance, and property value enhancement',
                mission: '1. Conduct comprehensive building inspection\n2. Update fire safety systems\n3. Renovate common areas and lobby\n4. Implement preventive maintenance schedule',
                reason: 'As a licensed contractor with 20 years in the industry, I have the technical expertise to ensure our building remains safe and well-maintained.',
                teamMembers: JSON.stringify([
                    'Rachel Green - Safety Inspector',
                    'Mark Davis - Maintenance Chief',
                    'Susan Chen - Quality Control'
                ]),
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop'
                ]),
                videos: JSON.stringify([])
            }
        ]

        const createdCandidates2025: Candidate[] = []
        for (let i = 0; i < candidates2025.length; i++) {
            const candidateData = candidates2025[i]
            // Try to find user by matching email, otherwise use index
            const candidateEmail = candidateEmails[i + 4] // Start from index 4 (after 2026 candidates)
            let userId = candidateUsers.find(u => u.email === candidateEmail)?.id || candidateUsers[i + 4]?.id

            if (!userId) {
                console.log(`  ⚠️  No user found for ${candidateData.name}, skipping...`)
                continue
            }

            const existing = await prisma.candidate.findFirst({
                where: {
                    projectId: project2025.id,
                    userId: userId
                }
            })

            let candidate: Candidate
            if (existing) {
                candidate = existing
                console.log(`  ⏭️  Candidate already exists: ${candidateData.name}`)
            } else {
                candidate = await prisma.candidate.create({
                    data: {
                        projectId: project2025.id,
                        userId: userId,
                        ...candidateData,
                        isActive: true,
                    }
                })
                console.log(`  ✅ Created candidate: ${candidateData.name}`)
            }
            createdCandidates2025.push(candidate)
        }

        // Add some votes for 2025 (active project)
        console.log('  📊 Adding sample votes...')
        const voteDistribution = [45, 67, 38] // Random votes for each candidate
        for (let i = 0; i < createdCandidates2025.length; i++) {
            const candidate = createdCandidates2025[i]
            const votesToAdd = voteDistribution[i]

            for (let v = 0; v < votesToAdd; v++) {
                // Use voters or create anonymous votes
                const voterId = voterUsers[v % voterUsers.length]?.id || voterUsers[0].id

                try {
                    await prisma.vote.create({
                        data: {
                            projectId: project2025.id,
                            candidateId: candidate.id,
                            userId: voterId,
                        }
                    })
                } catch (error) {
                    // Skip if duplicate vote (voter already voted)
                    continue
                }
            }
            console.log(`    Added ${votesToAdd} votes for ${candidate.name}`)
        }

        // PROJECT 3: ENDED - 2024 Head Apartments Election
        console.log('\n✅ Creating ENDED project: 2024 Head Apartments Election')

        let project2024 = await prisma.votingProject.findFirst({
            where: { title: '2024 Head Apartments Election' }
        })

        if (!project2024) {
            project2024 = await prisma.votingProject.create({
                data: {
                    title: '2024 Head Apartments Election',
                    description: 'Completed election for the apartment head of residence for 2024. Results have been finalized.',
                    votingType: 'HEAD_OF_APARTMENT',
                    votingMethod: 'ONE_PERSON_ONE_VOTE',
                    startDate: new Date('2023-11-01T00:00:00Z'),
                    endDate: new Date('2023-11-30T23:59:59Z'),
                    isActive: false,
                    isPublished: true,
                    status: 'ENDED',
                }
            })
        }
        console.log(`  Project ID: ${project2024.id}`)

        // Create 2 candidates for 2024
        const candidates2024 = [
            {
                name: 'Daniel Kim',
                vision: 'Building trust through transparency and effective management',
                mission: '1. Monthly financial reports to residents\n2. Regular building maintenance updates\n3. Open door policy for concerns\n4. Quarterly town hall meetings',
                reason: 'Winner of 2024 election with strong support from residents. Successfully implemented transparent governance and improved resident satisfaction.',
                teamMembers: JSON.stringify([
                    'Jessica Brown - Communications',
                    'Peter Wang - Operations',
                    'Sandra Mitchell - Finance'
                ]),
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=600&fit=crop'
                ]),
                videos: JSON.stringify([])
            },
            {
                name: 'Rebecca Foster',
                vision: 'Enhancing quality of life through community programs',
                mission: '1. Weekly fitness classes in common areas\n2. Book club and hobby groups\n3. Pet-friendly initiatives\n4. Senior citizen support programs',
                reason: 'Runner-up in 2024 election. Strong advocate for community programs and resident engagement initiatives.',
                teamMembers: JSON.stringify([
                    'Timothy Clark - Programs Director',
                    'Michelle Yang - Social Coordinator',
                    'Brian Thompson - Volunteer Manager'
                ]),
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop'
                ]),
                videos: JSON.stringify([])
            }
        ]

        const createdCandidates2024: Candidate[] = []
        for (let i = 0; i < candidates2024.length; i++) {
            const candidateData = candidates2024[i]
            // Try to find user by matching email, otherwise use index
            const candidateEmail = candidateEmails[i + 7] // Start from index 7 (after 2026 + 2025 candidates)
            let userId = candidateUsers.find(u => u.email === candidateEmail)?.id || candidateUsers[i + 7]?.id

            if (!userId) {
                console.log(`  ⚠️  No user found for ${candidateData.name}, skipping...`)
                continue
            }

            const existing = await prisma.candidate.findFirst({
                where: {
                    projectId: project2024.id,
                    userId: userId
                }
            })

            let candidate: Candidate
            if (existing) {
                candidate = existing
                console.log(`  ⏭️  Candidate already exists: ${candidateData.name}`)
            } else {
                candidate = await prisma.candidate.create({
                    data: {
                        projectId: project2024.id,
                        userId: userId,
                        ...candidateData,
                        isActive: false,
                    }
                })
                console.log(`  ✅ Created candidate: ${candidateData.name}`)
            }
            createdCandidates2024.push(candidate)
        }

        // Add final votes for 2024 (ended project)
        console.log('  📊 Adding final votes...')
        const finalVotes = [89, 54] // Daniel Kim won with 89 votes
        for (let i = 0; i < createdCandidates2024.length; i++) {
            const candidate = createdCandidates2024[i]
            const votesToAdd = finalVotes[i]

            for (let v = 0; v < votesToAdd; v++) {
                const voterId = voterUsers[v % voterUsers.length]?.id || voterUsers[0].id

                try {
                    await prisma.vote.create({
                        data: {
                            projectId: project2024.id,
                            candidateId: candidate.id,
                            userId: voterId,
                        }
                    })
                } catch (error) {
                    continue
                }
            }
            console.log(`    Added ${votesToAdd} votes for ${candidate.name}`)
        }

        console.log('\n🎉 All voting projects seeded successfully!\n')
        console.log('Summary:')
        console.log('  📅 UPCOMING: 2026 Head Apartments Election (4 candidates) - Starts Dec 5, 2025')
        console.log('  🗳️  ACTIVE: 2025 Head Apartments Election (3 candidates) - Currently running')
        console.log('  ✅ ENDED: 2024 Head Apartments Election (2 candidates) - Completed\n')

        await prisma.$disconnect()
    } catch (error) {
        console.error('❌ Error seeding projects:', error)
        await prisma.$disconnect()
        process.exit(1)
    }
}

seedProjects()
