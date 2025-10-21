import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function createCandidateUsers() {
    try {
        console.log('👥 Creating candidate users to match sample data...\n')

        const candidates = [
            // 2026 Head Apartments Election (4 candidates)
            {
                email: 'michael.chen@example.com',
                name: 'Michael Chen',
                apartmentUnit: 'A-501',
                apartmentSize: 120.0,
                phone: '+1 (555) 101-2001'
            },
            {
                email: 'sarah.martinez@example.com',
                name: 'Sarah Martinez',
                apartmentUnit: 'B-302',
                apartmentSize: 95.5,
                phone: '+1 (555) 102-2002'
            },
            {
                email: 'james.wilson@example.com',
                name: 'James Wilson',
                apartmentUnit: 'C-401',
                apartmentSize: 110.0,
                phone: '+1 (555) 103-2003'
            },
            {
                email: 'priya.sharma@example.com',
                name: 'Priya Sharma',
                apartmentUnit: 'A-205',
                apartmentSize: 88.0,
                phone: '+1 (555) 104-2004'
            },
            // 2025 Head Apartments Election (3 candidates)
            {
                email: 'robert.taylor@example.com',
                name: 'Robert Taylor',
                apartmentUnit: 'B-501',
                apartmentSize: 125.0,
                phone: '+1 (555) 105-2005'
            },
            {
                email: 'linda.martinez@example.com',
                name: 'Linda Martinez',
                apartmentUnit: 'C-201',
                apartmentSize: 92.0,
                phone: '+1 (555) 106-2006'
            },
            {
                email: 'anthony.lee@example.com',
                name: 'Anthony Lee',
                apartmentUnit: 'A-301',
                apartmentSize: 105.0,
                phone: '+1 (555) 107-2007'
            },
            // 2024 Head Apartments Election (2 candidates)
            {
                email: 'daniel.kim@example.com',
                name: 'Daniel Kim',
                apartmentUnit: 'B-401',
                apartmentSize: 115.0,
                phone: '+1 (555) 108-2008'
            },
            {
                email: 'rebecca.foster@example.com',
                name: 'Rebecca Foster',
                apartmentUnit: 'C-101',
                apartmentSize: 85.0,
                phone: '+1 (555) 109-2009'
            }
        ]

        const password = 'password123' // Same password as other test users
        const hashedPassword = await hashPassword(password)

        let created = 0
        let skipped = 0

        for (const candidateData of candidates) {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: candidateData.email }
            })

            if (existingUser) {
                console.log(`⏭️  User already exists: ${candidateData.name} (${candidateData.email})`)
                skipped++
                continue
            }

            // Create user with CANDIDATE role
            const user = await prisma.user.create({
                data: {
                    email: candidateData.email,
                    name: candidateData.name,
                    phone: candidateData.phone,
                    password: hashedPassword,
                    role: 'CANDIDATE',
                    apartmentUnit: candidateData.apartmentUnit,
                    apartmentSize: candidateData.apartmentSize,
                    language: 'en',
                    isActive: true,
                    isVerified: true,
                }
            })

            console.log(`✅ Created candidate user: ${user.name} (${user.email})`)
            console.log(`   Apartment: ${user.apartmentUnit} (${user.apartmentSize}m²)`)
            console.log(`   Phone: ${user.phone}\n`)
            created++
        }

        console.log('\n📊 Summary:')
        console.log(`   ✅ Created: ${created} users`)
        console.log(`   ⏭️  Skipped: ${skipped} users (already exist)`)
        console.log(`   📝 Total: ${candidates.length} candidate users\n`)

        console.log('🔑 Login Credentials:')
        console.log('   Email: [candidate-email]@example.com')
        console.log(`   Password: ${password}\n`)

        console.log('📋 Candidate Users Created:')
        console.log('\n2026 Project Candidates:')
        console.log('  1. Michael Chen       - michael.chen@example.com')
        console.log('  2. Sarah Martinez     - sarah.martinez@example.com')
        console.log('  3. James Wilson       - james.wilson@example.com')
        console.log('  4. Priya Sharma       - priya.sharma@example.com')
        console.log('\n2025 Project Candidates:')
        console.log('  5. Robert Taylor      - robert.taylor@example.com')
        console.log('  6. Linda Martinez     - linda.martinez@example.com')
        console.log('  7. Anthony Lee        - anthony.lee@example.com')
        console.log('\n2024 Project Candidates:')
        console.log('  8. Daniel Kim         - daniel.kim@example.com')
        console.log('  9. Rebecca Foster     - rebecca.foster@example.com\n')

        console.log('💡 Note: After creating these users, you may want to run:')
        console.log('   npm run seed:projects')
        console.log('   This will link these users to their candidate profiles.\n')

        await prisma.$disconnect()
    } catch (error) {
        console.error('❌ Error creating candidate users:', error)
        await prisma.$disconnect()
        process.exit(1)
    }
}

createCandidateUsers()
