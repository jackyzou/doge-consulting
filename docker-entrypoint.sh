#!/bin/sh
set -e

DB_PATH="${DATABASE_PATH:-/app/data/production.db}"
DB_DIR=$(dirname "$DB_PATH")

mkdir -p "$DB_DIR"

export DATABASE_URL="file:${DB_PATH}"
export DATABASE_PATH="$DB_PATH"

# Run migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy --schema ./prisma/schema.prisma

# Seed if the DB is freshly created (no admin user)
if [ ! -s "$DB_PATH" ] || [ "$(stat -c%s "$DB_PATH" 2>/dev/null || echo 0)" -lt 8192 ]; then
  echo "Seeding database..."
  node prisma/seed.mjs
fi

echo "Starting Next.js server..."
exec "$@"
