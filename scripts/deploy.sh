#!/bin/bash
# ── Doge Consulting — Quick Deploy (Docker) ────────────────────
# Run this on the target machine. Copy-paste friendly.
# Prereqs: git, docker, docker compose
set -e

cd /opt/doge-consulting 2>/dev/null || cd ~/doge-consulting 2>/dev/null || {
  echo "ERROR: Clone repo first: git clone https://github.com/jackyzou/doge-consulting.git"
  exit 1
}

echo "==> Pulling latest code..."
git pull origin master

echo "==> Stopping old containers..."
docker compose down 2>/dev/null || true

echo "==> Building (this takes 3-8 min on low-end machines)..."
# --no-cache only if you hit stale layer issues; otherwise remove it for speed
docker compose build

echo "==> Starting..."
docker compose up -d

echo "==> Waiting for health check..."
for i in $(seq 1 20); do
  sleep 5
  if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Deploy successful! Site is live at http://localhost:3000"
    docker compose logs --tail 20 app
    exit 0
  fi
  echo "  Waiting... ($i/20)"
done

echo "❌ Health check failed. Check logs:"
docker compose logs --tail 50 app
exit 1
