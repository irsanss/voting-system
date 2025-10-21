#!/bin/bash

# Database Migration Script for Production
set -e

echo "🗄️  Setting up production database..."

# Configuration
DB_PATH="/app/data/app.db"
BACKUP_PATH="/app/data/backups"

# Create data directory
mkdir -p /app/data
mkdir -p ${BACKUP_PATH}

# Check if database exists
if [ -f "${DB_PATH}" ]; then
    echo -e "📦 Database exists, creating backup..."
    cp ${DB_PATH} ${BACKUP_PATH}/backup-$(date +%Y%m%d-%H%M%S).db
fi

# Run database migrations
echo -e "🔄 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo -e "⚙️  Generating Prisma client..."
npx prisma generate

# Seed initial data if needed
if [ ! -f "${DB_PATH}" ] || [ "$1" = "--seed" ]; then
    echo -e "🌱 Seeding initial data..."
    npm run db:seed
fi

echo -e "✅ Database setup completed!"