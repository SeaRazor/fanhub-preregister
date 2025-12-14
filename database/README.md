# Database Migration Files

This directory contains the necessary files to migrate your local database to a remote PostgreSQL server.

## Files

- `init.sql` - Original schema initialization script
- `schema_backup.sql` - Complete DDL (Data Definition Language) export from local database
- `local_data_backup.sql` - Data-only export from local database
- `complete_backup.sql` - Complete database export (schema + data)

## Migration Steps

### 1. Set up your remote PostgreSQL database

Choose a provider (Supabase, Railway, Neon, AWS RDS, etc.) and create a new PostgreSQL database.

### 2. Configure environment variables

Copy `.env.local.template` to `.env.local` and fill in your remote database credentials:

```bash
cp .env.local .env.local
```

Edit `.env.local` with your actual database connection details.

### 3. Import schema and data to remote database

Option A - Import complete backup:
```bash
psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f database/complete_backup.sql
```

Option B - Import schema then data separately:
```bash
# Import schema
psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f database/schema_backup.sql

# Import data
psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f database/local_data_backup.sql
```

### 4. Test the connection

Run your application locally with the new environment variables to ensure it connects to the remote database successfully.

### 5. Deploy

Update your production environment variables and deploy your application.

## Current Data

Your local database contains:
- 1 verified registration (e.sidorovich@gmail.com)
- Stats table with fake_base_count of 15,412

## Database Schema

The database contains two main tables:

### registrations
- Stores user email registrations
- Handles verification workflow
- Tracks registration status and timestamps

### stats
- Stores fake base count for display purposes
- Single row table with id=1