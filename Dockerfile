# ── Stage 1: Install dependencies ──────────────────────────────
FROM node:20-slim AS deps

RUN apt-get update && apt-get install -y \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: Build ─────────────────────────────────────────────
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y \
    python3 make g++ openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Enable standalone output for Docker builds
ENV DOCKER_BUILD=1

RUN npx prisma generate
RUN npm run build

# ── Stage 3: Production ───────────────────────────────────────
FROM node:20-slim AS runner

RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy standalone server + static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma schema + migrations for runtime migrate
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder /app/node_modules/bindings ./node_modules/bindings
COPY --from=builder /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path
COPY --from=builder /app/node_modules/prebuild-install ./node_modules/prebuild-install

# Copy generated Prisma client
COPY --from=builder /app/src/generated ./src/generated

# Copy seed script and its deps
COPY --from=builder /app/prisma/seed.mjs ./prisma/seed.mjs
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

# Create data directory for SQLite
RUN mkdir -p /app/data

# Entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
