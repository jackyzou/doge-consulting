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

# Seed blog posts (uses INSERT OR IGNORE, safe to run multiple times)
echo "Syncing blog posts..."
node prisma/seed-blog.mjs
for f in prisma/seed-blog-*.mjs; do
  if [ -f "$f" ]; then
    echo "  Running $f..."
    node "$f" || echo "  Warning: $f failed (non-fatal)"
  fi
done

# Seed quotes (idempotent — checks before inserting)
for f in scripts/seed-quote-*.mjs; do
  if [ -f "$f" ]; then
    echo "  Seeding quote: $f..."
    node "$f" || echo "  Warning: $f failed (non-fatal)"
  fi
done

# Start 1688 search microservice in background (for AI Product Matcher)
if [ -f scripts/1688-search-server.mjs ]; then
  echo "Starting 1688 search microservice on port 4688..."
  node scripts/1688-search-server.mjs &
  SEARCH_PID=$!
  echo "  Search microservice PID: $SEARCH_PID"
fi

echo "Starting Next.js server..."
exec "$@"
