// Test script to create sample users for testing
import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('🔧 Creating test users...\n')

        // Hash password for all users (using 'password123' as default)
        const hashedPassword = await bcrypt.hash('password123', 10)

        // Create 5 Voter users
        console.log('👥 Creating 5 Voter users...')
        const voters = [
            {
                email: 'voter1@example.com',
                name: 'Alice Johnson',
                phone: '+1234567801',
                password: hashedPassword,
                role: 'VOTER' as UserRole,
                apartmentUnit: 'A101',
                apartmentSize: 85.5,
                isVerified: true,
                isActive: true
            },
            {
                email: 'voter2@example.com',
                name: 'Bob Smith',
                phone: '+1234567802',
                password: hashedPassword,
                role: 'VOTER' as UserRole,
                apartmentUnit: 'A102',
                apartmentSize: 92.3,
                isVerified: true,
                isActive: true
            },
            {
                email: 'voter3@example.com',
                name: 'Carol Williams',
                phone: '+1234567803',
                password: hashedPassword,
                role: 'VOTER' as UserRole,
                apartmentUnit: 'B201',
                apartmentSize: 78.0,
                isVerified: true,
                isActive: true
            },
            {
                email: 'voter4@example.com',
                name: 'David Brown',
                phone: '+1234567804',
                password: hashedPassword,
                role: 'VOTER' as UserRole,
                apartmentUnit: 'B202',
                apartmentSize: 88.7,
                isVerified: true,
                isActive: true
            },
            {
                email: 'voter5@example.com',
                name: 'Emma Davis',
                phone: '+1234567805',
                password: hashedPassword,
                role: 'VOTER' as UserRole,
                apartmentUnit: 'C301',
                apartmentSize: 95.2,
                isVerified: true,
                isActive: true
            }
        ]

        for (const voter of voters) {
            try {
                const created = await prisma.user.create({
                    data: voter
                })
                console.log(`  ✓ Created voter: ${created.name} (${created.email})`)
            } catch (error: any) {
                if (error.code === 'P2002') {
                    console.log(`  ⊘ Skipped voter: ${voter.name} (${voter.email}) - already exists`)
                } else {
                    throw error
                }
            }
        }

        // Create 4 Administrative users
        console.log('\n👔 Creating 4 Administrative users...')
        const admins = [
            {
                email: 'committee1@example.com',
                name: 'Frank Martinez',
                phone: '+1234567811',
                password: hashedPassword,
                role: 'COMMITTEE' as UserRole,
                apartmentUnit: 'N/A',
                apartmentSize: 0,
                isVerified: true,
                isActive: true
            },
            {
                email: 'supervisor1@example.com',
                name: 'Grace Lee',
                phone: '+1234567812',
                password: hashedPassword,
                role: 'SUPERVISOR' as UserRole,
                apartmentUnit: 'N/A',
                apartmentSize: 0,
                isVerified: true,
                isActive: true
            },
            {
                email: 'auditor1@example.com',
                name: 'Henry Wilson',
                phone: '+1234567813',
                password: hashedPassword,
                role: 'AUDITOR' as UserRole,
                apartmentUnit: 'N/A',
                apartmentSize: 0,
                isVerified: true,
                isActive: true
            },
            {
                email: 'superadmin1@example.com',
                name: 'Isabel Garcia',
                phone: '+1234567814',
                password: hashedPassword,
                role: 'SUPERADMIN' as UserRole,
                apartmentUnit: 'N/A',
                apartmentSize: 0,
                isVerified: true,
                isActive: true
            }
        ]

        for (const admin of admins) {
            try {
                const created = await prisma.user.create({
                    data: admin
                })
                console.log(`  ✓ Created ${admin.role}: ${created.name} (${created.email})`)
            } catch (error: any) {
                if (error.code === 'P2002') {
                    console.log(`  ⊘ Skipped ${admin.role}: ${admin.name} (${admin.email}) - already exists`)
                } else {
                    throw error
                }
            }
        }

        console.log('\n✅ All test users created successfully!')
        console.log('\n📋 Login Credentials Summary:')
        console.log('━'.repeat(60))
        console.log('\n👥 VOTERS (password: password123):')
        voters.forEach((v, i) => {
            console.log(`  ${i + 1}. ${v.email} - ${v.name} (${v.apartmentUnit})`)
        })
        console.log('\n👔 ADMINISTRATIVE USERS (password: password123):')
        admins.forEach((a, i) => {
            console.log(`  ${i + 1}. ${a.email} - ${a.name} (${a.role})`)
        })
        console.log('\n━'.repeat(60))
        console.log('\n🔑 All users have password: password123')
        console.log('🌐 Login at: http://127.0.0.1:3000/auth/login')
        console.log('\n✨ Test the following:')
        console.log('  1. Login as each voter - should redirect to /dashboard')
        console.log('  2. Login as committee - should redirect to /admin/dashboard')
        console.log('  3. Login as supervisor - should redirect to /supervisor/dashboard')
        console.log('  4. Login as auditor - should redirect to /dashboard')
        console.log('  5. Login as superadmin - should redirect to /admin/dashboard')

    } catch (error) {
        console.error('❌ Error creating test users:', error)
        if (error instanceof Error) {
            console.error('Details:', error.message)
        }
    } finally {
        await prisma.$disconnect()
    }
}

main()
