#!/bin/bash

# Exit on error
set -e

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed. Please install it first."
    echo "Visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if environment variables are set
if [ -z "$SUPABASE_PROJECT_REF" ] || [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "Error: Required environment variables are not set."
    echo "Please set SUPABASE_PROJECT_REF and SUPABASE_DB_PASSWORD"
    exit 1
fi

# Run migrations in order
MIGRATIONS=(
    "20240201000000_create_analysis_tables.sql"
    "20240202000000_create_onboarding_table.sql"
    "20240202000000_create_subscription_tables.sql"
    "20240202000001_create_credit_functions.sql"
    "20240301000000_add_mfa_tables_and_functions.sql"
    "20240830180000_add_avatar_path_to_profiles.sql"
    "20240830210000_add_2fa_tables.sql"
)

for migration in "${MIGRATIONS[@]}"; do
    echo "Running migration: $migration"
    supabase db push --db-url="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres" \
        --file="supabase/migrations/$migration"
done

echo "All migrations completed successfully!"

# Mark the first todo as completed
echo "✅ Database migrations have been run in production"
