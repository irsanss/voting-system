import { db } from '../src/lib/db'

async function addSocialMediaColumn() {
    try {
        // Add socialMedia column to candidates table if it doesn't exist
        await db.$executeRawUnsafe(`
            ALTER TABLE candidates ADD COLUMN socialMedia TEXT;
        `)
        console.log('✅ Added socialMedia column to candidates table')
    } catch (error: any) {
        if (error.message.includes('duplicate column name')) {
            console.log('✅ socialMedia column already exists')
        } else {
            console.error('❌ Error adding socialMedia column:', error)
        }
    } finally {
        await db.$disconnect()
    }
}

addSocialMediaColumn()
