#!/bin/sh
set -e

DB_PATH="${DATABASE_PATH:-/app/data/production.db}"
DB_DIR=$(dirname "$DB_PATH")

mkdir -p "$DB_DIR"

export DATABASE_URL="file:${DB_PATH}"
export DATABASE_PATH="$DB_PATH"

PRISMA_CLI="node ./node_modules/prisma/build/index.js"

# Run migrations
echo "Running Prisma migrations..."
$PRISMA_CLI migrate deploy --schema ./prisma/schema.prisma

# Seed if no users exist yet (fresh DB after migrations)
USER_COUNT=$(node -e "const D=require('better-sqlite3');const db=new D('$DB_PATH');const r=db.prepare('SELECT COUNT(*) as c FROM User').get();console.log(r.c);" 2>/dev/null || echo "0")
if [ "$USER_COUNT" = "0" ]; then
  echo "Seeding database..."
  node prisma/seed.mjs
fi

# Seed blog posts if none exist
BLOG_COUNT=$(node -e "const D=require('better-sqlite3');const db=new D('$DB_PATH');const r=db.prepare('SELECT COUNT(*) as c FROM BlogPost').get();console.log(r.c);" 2>/dev/null || echo "0")
if [ "$BLOG_COUNT" = "0" ]; then
  echo "Seeding blog posts..."
  node prisma/seed-blog.mjs
fi

echo "Starting Next.js server..."
exec "$@"
