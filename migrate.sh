#!/bin/bash

# Database Migration Script for FanHub Pre-register
# This script helps migrate from local to remote PostgreSQL database

set -e

echo "🚀 FanHub Database Migration Tool"
echo "================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "Please copy .env.local.template to .env.local and configure your remote database credentials."
    exit 1
fi

# Source environment variables
source .env.local

# Check required variables
if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ Missing required database environment variables in .env.local"
    echo "Required: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD"
    exit 1
fi

echo "📋 Configuration:"
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Port: ${DB_PORT:-5432}"
echo

# Test connection to default database first
echo "🔍 Testing connection to PostgreSQL server..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d postgres -p ${DB_PORT:-5432} -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Server connection successful!"
else
    echo "❌ Failed to connect to PostgreSQL server. Please check your credentials."
    exit 1
fi

# Check if scorefluence database exists, create if it doesn't
echo "🔍 Checking if '$DB_NAME' database exists..."
DB_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d postgres -p ${DB_PORT:-5432} -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" = "1" ]; then
    echo "✅ Database '$DB_NAME' already exists."
else
    echo "📦 Creating database '$DB_NAME'..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d postgres -p ${DB_PORT:-5432} -c "CREATE DATABASE $DB_NAME;"
    echo "✅ Database '$DB_NAME' created successfully!"
fi

# Test connection to the target database
echo "🔍 Testing connection to '$DB_NAME' database..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p ${DB_PORT:-5432} -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
else
    echo "❌ Failed to connect to '$DB_NAME' database."
    exit 1
fi

echo
read -p "Do you want to import the complete database (schema + data)? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Importing complete database..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p ${DB_PORT:-5432} -f database/complete_backup.sql
    echo "✅ Database migration completed!"
    
    # Verify tables were created
    echo "🔍 Verifying tables..."
    TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p ${DB_PORT:-5432} -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
    echo "✅ Found $TABLE_COUNT tables in the database"
    
    # Show registration count
    REG_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p ${DB_PORT:-5432} -tAc "SELECT COUNT(*) FROM registrations" 2>/dev/null || echo "0")
    echo "✅ Imported $REG_COUNT registration(s)"
    
else
    echo "Skipping database import. You can manually run:"
    echo "PGPASSWORD=\$DB_PASSWORD psql -h \$DB_HOST -U \$DB_USER -d \$DB_NAME -p \${DB_PORT:-5432} -f database/complete_backup.sql"
fi

echo
echo "🎉 Migration script completed!"
echo
echo "Next steps:"
echo "1. Test your application locally with: npm run dev"
echo "2. Verify all API endpoints work correctly"
echo "3. Update your production environment variables"
echo "4. Deploy your application"