// Script to fix existing projects that require supervisor review but have no status set
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Finding projects that need supervisor review but have no status...')

        const projectsToFix = await prisma.votingProject.findMany({
            where: {
                requiresSupervisorReview: true,
                supervisorApprovalStatus: null
            },
            select: {
                id: true,
                title: true
            }
        })

        console.log(`Found ${projectsToFix.length} projects to fix`)

        if (projectsToFix.length === 0) {
            console.log('No projects need fixing!')
            return
        }

        // Update each project
        for (const project of projectsToFix) {
            await prisma.votingProject.update({
                where: { id: project.id },
                data: {
                    supervisorApprovalStatus: 'PENDING'
                }
            })
            console.log(`✓ Fixed project: ${project.title} (${project.id})`)
        }

        console.log('\n✅ All projects fixed successfully!')
    } catch (error) {
        console.error('Error fixing projects:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
