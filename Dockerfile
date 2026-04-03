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

# Limit Node memory for low-end machines (1.5GB)
ENV NODE_OPTIONS="--max-old-space-size=1536"

RUN npx prisma generate
RUN npm run build

# ── Stage 3: Production ───────────────────────────────────────
FROM node:20-slim AS runner

RUN apt-get update && apt-get install -y \
    openssl \
    # Playwright Chromium dependencies for 1688 search microservice
    libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libgbm1 \
    libpango-1.0-0 libcairo2 libasound2 libxshmfence1 libx11-6 \
    libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 \
    libatspi2.0-0 libcups2 libdbus-1-3 libgtk-3-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_OPTIONS="--max-old-space-size=512"

# Copy ALL node_modules first (ensures Prisma CLI + all transitive deps are available)
COPY --from=deps /app/node_modules ./node_modules

# Copy standalone server on top (merges traced/optimized modules over full node_modules)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma schema, migrations, generated client, and config
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy seed scripts
COPY --from=builder /app/prisma/seed.mjs ./prisma/seed.mjs
COPY --from=builder /app/prisma/seed-blog.mjs ./prisma/seed-blog.mjs
COPY --from=builder /app/prisma/seed-blog-expansion.mjs ./prisma/seed-blog-expansion.mjs
COPY --from=builder /app/prisma/seed-blog-tariffs-2026.mjs ./prisma/seed-blog-tariffs-2026.mjs
COPY --from=builder /app/prisma/seed-blog-landed-cost.mjs ./prisma/seed-blog-landed-cost.mjs
COPY --from=builder /app/prisma/seed-blog-blinds.mjs ./prisma/seed-blog-blinds.mjs

# Copy VERSION file for health endpoint
COPY --from=builder /app/VERSION ./VERSION

# Copy 1688 search microservice
COPY --from=builder /app/scripts/1688-search-server.mjs ./scripts/1688-search-server.mjs

# Install Playwright Chromium browser (for 1688 search)
RUN npx playwright install chromium 2>/dev/null || echo 'Playwright install skipped'

# Create data directory for SQLite
RUN mkdir -p /app/data

# Entrypoint script (fix Windows CRLF → LF)
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN sed -i 's/\r$//' /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
