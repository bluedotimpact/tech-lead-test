#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."

# Wait for PostgreSQL to be ready
until pg_isready -h postgres -p 5432 -U postgres
do
  echo "Waiting for database..."
  sleep 2
done

echo "PostgreSQL is ready!"

# Always run db:fresh to ensure database is in correct state
echo "Setting up database..."
npm run db:fresh
echo "Database setup complete!"

# Start the application
echo "Starting the application..."
exec npm run dev