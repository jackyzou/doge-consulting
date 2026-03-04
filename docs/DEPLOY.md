# DEPLOY.md — Docker Deployment Runbook (Detailed)

> **Audience**: An AI coding agent (Claude Haiku 4.5 or similar) deploying
> Doge Consulting onto a fresh Windows 10/11 laptop.
>
> ## RULES FOR THE DEPLOYING AGENT
>
> 1. Every command below is **PowerShell**. Run them **in exact order**.
> 2. **Do NOT skip any step.**
> 3. **Do NOT modify** any of these repo files: `Dockerfile`, `docker-compose.yml`,
>    `docker-entrypoint.sh`, `next.config.ts`, `.dockerignore`.
>    They are already correct and tested.
> 4. The **only file you create** is `.env` (in the project root).
> 5. If a command fails, check the **Troubleshooting** section at the bottom
>    BEFORE trying to fix it yourself. Do NOT improvise fixes.
> 6. After every command, check the output matches what's documented here.

---

## Architecture Overview

```
Internet
  ↓
doge-consulting.com (Cloudflare DNS + SSL)
  ↓
Cloudflare Named Tunnel (token auth)
  ↓
Docker container "doge-tunnel" (cloudflared)
  │
  │  network_mode: "service:app"  ← shares network namespace with app
  │  So "localhost:3000" in the tunnel = the app container
  ↓
Docker container "doge-app" (Next.js standalone, port 3000)
  ↓
SQLite database at ./data/production.db (Docker volume mount)
```

### Critical Technical Facts

These facts explain WHY the config files are the way they are.
**Do NOT "fix" anything that contradicts these facts.**

1. **`network_mode: "service:app"`** in docker-compose.yml means the tunnel
   container shares the app container's network. So the tunnel reaches the
   app at `localhost:3000`, **NOT** at `http://app:3000`.

2. **Cloudflare Dashboard tunnel config** must have service URL = `localhost:3000`
   (NOT `app:3000`). This matches fact #1.

3. **Prisma CLI** in the container uses `node ./node_modules/prisma/build/index.js`
   (NOT `npx prisma`). `npx` fails in standalone mode because `.bin` symlinks
   are not included in the standalone output.

4. **Full `node_modules`** from the deps stage is copied into the runner stage.
   This is intentional — standalone traces most deps, but Prisma CLI and its
   transitive dependencies (valibot, @prisma/dev) need the full node_modules.

5. **`DOCKER_BUILD=1`** env var in the Dockerfile builder stage enables
   `output: "standalone"` in `next.config.ts`. This is already set in the Dockerfile.

6. **The Dockerfile fixes Windows line endings** automatically:
   `RUN sed -i 's/\r$//' /app/docker-entrypoint.sh`
   So even if the file has CRLF endings, the container will work.

7. **Seed detection** checks the User table row count (NOT file size).
   This is because `prisma migrate deploy` creates the database file
   BEFORE seeding happens, so file existence/size checks would always
   think the DB is already seeded.

---

## Prerequisites

The target Windows laptop needs exactly two things installed:

### 1. Docker Desktop

Download from https://www.docker.com/products/docker-desktop/ and install.

Or install via winget:
```powershell
winget install Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
```

**After installing Docker Desktop, restart the computer.**

### 2. Git

Download from https://git-scm.com/ and install (use all defaults).

Or install via winget:
```powershell
winget install Git.Git --accept-package-agreements --accept-source-agreements
```

**If you just installed Git, close and reopen PowerShell so `git` is on PATH.**

---

## Step 1 of 9: Start Docker Desktop

Docker Desktop must be running before any `docker` command will work.

### Check if Docker is already running:
```powershell
docker info
```

**If you see output like "Server Version: ..." and "Docker Root Dir: ..."**, Docker is running. **Go to Step 2.**

**If you see "error during connect" or "Cannot connect to the Docker daemon"**, Docker is NOT running. Start it:

```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Wait for Docker to be ready:
Docker Desktop takes 30-90 seconds to start. Run this loop to wait:

```powershell
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 3
  $result = docker info 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Docker is ready!"
    break
  }
  Write-Host "Waiting for Docker... attempt $($i+1) of 30"
}
```

**Expected output:** After some "Waiting..." lines, you should see `Docker is ready!`.

### Verify Docker is working:
```powershell
docker --version
```
**Expected output:** `Docker version 24.x.x` or `Docker version 27.x.x` or `Docker version 29.x.x` (any version 24+ is fine).

```powershell
docker compose version
```
**Expected output:** `Docker Compose version v2.x.x` (any v2+ is fine).

**If `docker compose version` fails but `docker-compose --version` works**, you have the old standalone Compose. The commands below use `docker compose` (without hyphen). You can either:
- Update Docker Desktop to latest version, OR
- Replace `docker compose` with `docker-compose` in all commands below.

---

## Step 2 of 9: Clone the Repository

### If this is a fresh laptop (no existing clone):
```powershell
git clone https://github.com/jackyzou/doge-consulting.git C:\doge-consulting
cd C:\doge-consulting
```

**Expected output:**
```
Cloning into 'C:\doge-consulting'...
remote: Enumerating objects: ...
...
Resolving deltas: 100% ...
```

### If the repo is already cloned:
```powershell
cd C:\doge-consulting
git pull origin master
```

**Expected output:**
```
Already up to date.
```
or a list of changed files.

### Verify you're in the right directory:
```powershell
Get-Location
```
**Expected output:** `C:\doge-consulting`

```powershell
Test-Path Dockerfile
```
**Expected output:** `True`

```powershell
Test-Path docker-compose.yml
```
**Expected output:** `True`

```powershell
Test-Path docker-entrypoint.sh
```
**Expected output:** `True`

**If any of the above shows `False`, STOP. You're in the wrong directory or the files are missing. Run `git pull origin master` to update.**

---

## Step 3 of 9: Create the `.env` File

The `.env` file provides secrets to `docker-compose.yml`.
It must be created at `C:\doge-consulting\.env` (project root, same directory as `docker-compose.yml`).

### RULES for the `.env` file:
- **NO comments** on the same line as a value
- **NO quotes** around values
- **NO trailing spaces** after values
- **NO blank lines** between entries
- Exactly **7 lines**, each with format `KEY=value`

### Create the file:

```powershell
@"
JWT_SECRET=REPLACE_THIS
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=dogetech77@gmail.com
SMTP_PASS=REPLACE_THIS
SMTP_FROM=dogetech77@gmail.com
CLOUDFLARE_TUNNEL_TOKEN=REPLACE_THIS
"@ | Set-Content -Path "C:\doge-consulting\.env" -Encoding UTF8NoBOM
```

**Now you must replace the 3 placeholder values:**

---

### 3a. JWT_SECRET

Generate a random hex string (at least 64 characters). Use one of these methods:

**Method A (if Node.js is installed):**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the entire output (a 128-character hex string). This is your JWT_SECRET.

**Method B (PowerShell only — no Node.js needed):**
```powershell
-join ((1..64) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
```
Copy the entire output. This is your JWT_SECRET.

**Replace `REPLACE_THIS` on the JWT_SECRET line with the value you generated.**

---

### 3b. SMTP_PASS

This is the Gmail App Password for `dogetech77@gmail.com`.

The current app password is: `lelfqnwaxpgxzsnn`

**Replace `REPLACE_THIS` on the SMTP_PASS line with: `lelfqnwaxpgxzsnn`**

If this password has been revoked, create a new one:
1. Go to https://myaccount.google.com/apppasswords
2. Sign in as `dogetech77@gmail.com`
3. Create a new App Password for "Mail"
4. Use the 16-character password shown (remove spaces)

---

### 3c. CLOUDFLARE_TUNNEL_TOKEN

This is a long base64 string starting with `eyJ`.

For the existing tunnel (`doge-consulting`), the token is:
```
eyJhIjoiMDg5ZjY3NTQ1ZDRmZjc2Nzc2ZTMzNzIyZGIzYjQzNjAiLCJ0IjoiMzljNGI4NTQtYTIyOS00MWM2LTg1M2YtNGUwZWRjYzkyMWIyIiwicyI6Ik5qVTJORGd3WkRrdE1qaGxNaTAwTmpFMkxUazFOMlF0T0dFd1pXTTJPV1ZrTTJabSJ9
```

**Replace `REPLACE_THIS` on the CLOUDFLARE_TUNNEL_TOKEN line with the token above.**

If you need a new token: Cloudflare Dashboard → Networks → Tunnels → click your tunnel → Configure → Install connector. The token is the string after `--token` in the install command.

---

### 3d. Verify the `.env` file

After replacing all 3 values, verify:

```powershell
Get-Content C:\doge-consulting\.env
```

**Expected output (example — your JWT_SECRET will be different):**
```
JWT_SECRET=ce1214a1a81c5027192b7f3561b222ba54ffe23cfaecff7f9f07be9d51ec1ce87f624b75293c002a80b23703d93656f223c79668806fba006e09ec3e91983057
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=dogetech77@gmail.com
SMTP_PASS=lelfqnwaxpgxzsnn
SMTP_FROM=dogetech77@gmail.com
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoiMDg5ZjY3NTQ1ZDRmZjc2Nzc2ZTMzNzIyZGIzYjQzNjAiLCJ0IjoiMzljNGI4NTQtYTIyOS00MWM2LTg1M2YtNGUwZWRjYzkyMWIyIiwicyI6Ik5qVTJORGd3WkRrdE1qaGxNaTAwTmpFMkxUazFOMlF0T0dFd1pXTTJPV1ZrTTJabSJ9
```

**CHECK: You should see exactly 7 lines. No `REPLACE_THIS` should remain. No quotes. No comments.**

```powershell
# Count lines (must be 7)
(Get-Content C:\doge-consulting\.env).Count
```
**Expected output:** `7`

```powershell
# Check no placeholders remain
Select-String "REPLACE_THIS" C:\doge-consulting\.env
```
**Expected output:** (no output — means no matches, which is correct)

**If `Select-String` finds matches, you forgot to replace a placeholder. Go back and fix it.**

---

## Step 4 of 9: Create Data Directories

```powershell
New-Item -ItemType Directory -Path "C:\doge-consulting\data" -Force
New-Item -ItemType Directory -Path "C:\doge-consulting\logs" -Force
```

**Expected output:**
```
    Directory: C:\doge-consulting

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         ...                                data
d-----         ...                                logs
```

(If they already exist, the `-Force` flag prevents errors.)

---

## Step 5 of 9: Verify Cloudflare Tunnel Configuration

**NOTE: This step is done manually in a web browser by the human operator,
or by the AI agent guiding the human.** The AI agent cannot access the
Cloudflare Dashboard directly.

Open a browser and go to: https://one.dash.cloudflare.com/

### 5a. Check tunnel exists and has correct hostname

1. Click **Networks** in the left sidebar
2. Click **Tunnels**
3. You should see a tunnel named `doge-consulting`
4. Click on it → click **Configure**
5. Click the **Public Hostnames** tab
6. There should be a row with:
   - **Hostname:** `doge-consulting.com`
   - **Service:** `HTTP://localhost:3000`

**If the Service shows `HTTP://app:3000` instead of `HTTP://localhost:3000`:**
- Click the three dots → **Edit**
- Change the URL from `app:3000` to `localhost:3000`
- Click **Save hostname**

**If no hostname is configured:**
- Click **Add a public hostname**
- Subdomain: (leave blank)
- Domain: `doge-consulting.com`
- Path: (leave blank)
- Type: `HTTP`
- URL: `localhost:3000`
- Click **Save hostname**

### 5b. Check SSL settings

1. Go to the `doge-consulting.com` domain in Cloudflare
2. Click **SSL/TLS** → **Overview**
3. Encryption mode must be **Full** (not "Flexible", not "Off")
4. Click **SSL/TLS** → **Edge Certificates**
5. **Always Use HTTPS** must be turned **ON**

**If any of these are wrong, fix them now before proceeding.**

---

## Step 6 of 9: Build the Docker Image

```powershell
cd C:\doge-consulting
```

### Remove any stale database from previous deployments:
```powershell
if (Test-Path C:\doge-consulting\data\production.db) {
  Remove-Item C:\doge-consulting\data\production.db -Force
  Write-Host "Removed stale database"
} else {
  Write-Host "No stale database found (this is fine)"
}
```

### Build the Docker image:
```powershell
docker compose build --no-cache
```

**This takes 3-5 minutes.** You will see lots of output.

**Expected output (key lines to look for near the end):**
```
...
 => [builder 7/7] RUN npm run build                                        ...
 => [runner  ...] COPY --from=deps /app/node_modules ./node_modules         ...
 => [runner  ...] COPY --from=builder /app/.next/standalone ./              ...
...
 => exporting to image                                                      ...
 => => naming to docker.io/library/doge-consulting-app                      ...
```

**The last line should say "naming to docker.io/library/doge-consulting-app" or similar. This means the build succeeded.**

### If the build fails:

**Failure: "parent snapshot does not exist" or "failed to compute cache key"**
→ This is Docker cache corruption. Just run the same command again:
```powershell
docker compose build --no-cache
```

**Failure: npm ERR! with @swc/helpers or package-lock.json errors**
→ The lock file is out of sync. Fix it:
```powershell
npm install
npm install @swc/helpers@0.5.19
docker compose build --no-cache
```

**Failure: "Cannot find module" during `npm run build`**
→ This usually means `npm ci` failed silently. Check the build output above for npm errors. If you see python3/make/g++ errors, the build tools failed to install. Try:
```powershell
docker compose build --no-cache
```
(A simple retry often fixes transient network issues.)

**Any other failure:** Copy the **last 20 lines** of the error output and consult the Troubleshooting section at the bottom of this document.

---

## Step 7 of 9: Start the Containers

```powershell
docker compose up -d
```

**Expected output:**
```
[+] Running 2/2
 ✔ Container doge-app     Started
 ✔ Container doge-tunnel   Started
```

or

```
[+] Running 2/2
 ✔ Container doge-app     Healthy
 ✔ Container doge-tunnel   Started
```

### Wait for the app to become healthy:

The app container has a healthcheck that runs every 30 seconds. Wait for it:

```powershell
for ($i = 0; $i -lt 20; $i++) {
  Start-Sleep -Seconds 5
  $status = (docker inspect --format='{{.State.Health.Status}}' doge-app 2>$null)
  Write-Host "Container status: $status (attempt $($i+1) of 20)"
  if ($status -eq "healthy") {
    Write-Host "SUCCESS: App container is healthy!"
    break
  }
}
```

**Expected output after 15-30 seconds:**
```
Container status: starting (attempt 1 of 20)
Container status: starting (attempt 2 of 20)
...
Container status: healthy (attempt N of 20)
SUCCESS: App container is healthy!
```

**If after 20 attempts (100 seconds) it still says "starting" or "unhealthy":**
Check the logs:
```powershell
docker logs doge-app 2>&1
```
Look at the last 10 lines for error messages. Common errors and fixes:

- **"Cannot find module 'valibot'"** → The Dockerfile is wrong. But it should be correct from the repo. Did you modify it? Revert: `git checkout -- Dockerfile` and rebuild.
- **"prisma: not found"** → The entrypoint is trying `npx prisma`. Make sure `docker-entrypoint.sh` has `PRISMA_CLI="node ./node_modules/prisma/build/index.js"`. Did you modify it? Revert: `git checkout -- docker-entrypoint.sh` and rebuild.
- **Permission denied on docker-entrypoint.sh** → Line ending issue. But the Dockerfile has a CRLF fix (`sed -i 's/\r$//'`). This should never happen with the current Dockerfile. If it does, revert: `git checkout -- Dockerfile docker-entrypoint.sh` and rebuild.

### Verify both containers are running:
```powershell
docker compose ps
```

**Expected output:**
```
NAME          SERVICE   STATUS                  PORTS
doge-app      app       Up X minutes (healthy)  0.0.0.0:3000->3000/tcp
doge-tunnel   tunnel    Up X minutes
```

**BOTH containers must be "Up". The app must show "(healthy)". If either is missing or shows "Exited", check its logs:**
```powershell
docker logs doge-app 2>&1
docker logs doge-tunnel 2>&1
```

---

## Step 8 of 9: Verify the Database is Seeded

The entrypoint script automatically seeds the database when it detects zero users.
Let's verify:

```powershell
docker logs doge-app 2>&1 | Select-String "Seed|seed|Admin|admin"
```

**Expected output (one of these):**
```
Seeding database...
✅  Admin user: admin@dogeconsulting.com / admin123
✅  Customer user: sarah@example.com / user123
✅  12 products seeded
🎉 Seed complete!
```

**If you see the seed output above,** the database is seeded. **Go to Step 9.**

**If you see NO seed-related output**, the auto-seed may have failed silently.
Seed manually:

```powershell
docker exec doge-app node prisma/seed.mjs
```

**Expected output:**
```
🌱 Seeding database …
✅  Admin user: admin@dogeconsulting.com / admin123
✅  Customer user: sarah@example.com / user123
✅  12 products seeded
🎉 Seed complete!
```

**If manual seeding fails with "table User already has data"** or similar, the database was already seeded. This is fine.

---

## Step 9 of 9: Verify Everything Works

Run ALL of these checks. Every one must pass.

### 9a. Container health
```powershell
docker compose ps
```
**✅ PASS if:** Both `doge-app` and `doge-tunnel` show "Up" and app shows "(healthy)".

### 9b. App logs show successful startup
```powershell
docker logs doge-app 2>&1 | Select-String "Ready|migrations|Seed"
```
**✅ PASS if:** You see lines about migrations being applied and "Ready in XXms".

### 9c. Tunnel logs show connection
```powershell
docker logs doge-tunnel 2>&1 | Select-String "Registered|connection"
```
**✅ PASS if:** You see "Registered tunnel connection" lines (should be 4 connections).

### 9d. Local health check
```powershell
$response = Invoke-RestMethod http://localhost:3000/api/health
Write-Host "Status: $($response.status)"
```
**✅ PASS if:** Output shows `Status: ok`.

### 9e. Domain health check
```powershell
try {
  $r = Invoke-WebRequest -Uri "https://doge-consulting.com/api/health" -UseBasicParsing -TimeoutSec 30
  Write-Host "Domain check: $($r.StatusCode) - $($r.Content)"
} catch {
  Write-Host "Domain check FAILED: $($_.Exception.Message)"
}
```
**✅ PASS if:** Output shows `Domain check: 200 - {"status":"ok",...}`.

**If it shows "timed out":** DNS may not have propagated. Try:
```powershell
ipconfig /flushdns
nslookup doge-consulting.com 1.1.1.1
```
If nslookup returns IP addresses, DNS is fine — just wait 2-5 minutes and retry.

### 9f. SMTP env vars are set in container
```powershell
docker exec doge-app printenv | findstr SMTP
```
**✅ PASS if:** You see 5 lines: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.

**If you see NO SMTP output:** The `.env` file was wrong or the container was started before `.env` was created. Fix:
```powershell
docker compose down
docker compose up -d
```

### 9g. Admin login works
```powershell
$body = '{"email":"admin@dogeconsulting.com","password":"admin123"}'
$r = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
Write-Host "Login status: $($r.StatusCode)"
```
**✅ PASS if:** Output shows `Login status: 200`.

### 9h. Customer login works
```powershell
$body = '{"email":"sarah@example.com","password":"user123"}'
$r = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
Write-Host "Login status: $($r.StatusCode)"
```
**✅ PASS if:** Output shows `Login status: 200`.

### 9i. Homepage loads
```powershell
$r = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 15
Write-Host "Homepage status: $($r.StatusCode)"
```
**✅ PASS if:** Output shows `Homepage status: 200`.

---

## Login Credentials (Seeded by Default)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dogeconsulting.com` | `admin123` |
| Customer | `sarah@example.com` | `user123` |

> ⚠️ **Change the admin password** after first login at `/admin/settings`.

---

## Common Operations (After Deployment)

### Stop everything:
```powershell
cd C:\doge-consulting
docker compose down
```

### Restart after code changes:
```powershell
cd C:\doge-consulting
git pull origin master
docker compose build --no-cache
docker compose up -d
```

### View live logs:
```powershell
docker compose logs -f app       # app logs (Ctrl+C to stop)
docker compose logs -f tunnel    # tunnel logs (Ctrl+C to stop)
```

### Re-seed database (adds default users if missing):
```powershell
docker exec doge-app node prisma/seed.mjs
```

### Full reset (delete database and start fresh):
```powershell
cd C:\doge-consulting
docker compose down
Remove-Item C:\doge-consulting\data\production.db -Force -ErrorAction SilentlyContinue
docker compose up -d
# Wait for healthy, then seed if needed:
Start-Sleep -Seconds 30
docker exec doge-app node prisma/seed.mjs
```

### Database backup:
```powershell
New-Item -ItemType Directory -Path "C:\doge-consulting\data\backups" -Force
Copy-Item C:\doge-consulting\data\production.db "C:\doge-consulting\data\backups\production-$(Get-Date -Format 'yyyyMMdd-HHmmss').db"
```

---

## Troubleshooting Guide

### Problem 1: `docker compose build` fails with "parent snapshot does not exist"
**Cause:** Docker build cache corruption (happens sometimes on Windows).
**Fix:** Run the exact same command again. It will work on retry:
```powershell
docker compose build --no-cache
```

---

### Problem 2: `docker compose build` fails with npm/package-lock errors
**Cause:** `package-lock.json` is out of sync with `package.json`.
**Fix:**
```powershell
npm install
npm install @swc/helpers@0.5.19
docker compose build --no-cache
```
**Do NOT run `git checkout -- package-lock.json`** — that would restore the old broken lock file.

---

### Problem 3: Container starts but healthcheck fails (status: unhealthy)
**Cause:** The Next.js app failed to start inside the container.
**Diagnose:**
```powershell
docker logs doge-app 2>&1
```
**Read the last 20 lines of output.** Common sub-causes:

**Sub-cause A: "Cannot find module 'valibot'" or "Cannot find module '@prisma/dev'"**
→ The Dockerfile isn't copying full node_modules. This means the Dockerfile was modified.
→ Fix: `git checkout -- Dockerfile` then `docker compose build --no-cache`.

**Sub-cause B: "prisma: not found" or "sh: prisma: command not found"**
→ The entrypoint is using `npx prisma` instead of `node ./node_modules/prisma/build/index.js`.
→ Fix: `git checkout -- docker-entrypoint.sh` then `docker compose build --no-cache`.

**Sub-cause C: "ENOENT" error about database or data directory**
→ The data directory doesn't exist or isn't mounted.
→ Fix: `New-Item -ItemType Directory -Path "C:\doge-consulting\data" -Force` then restart:
```powershell
docker compose down
docker compose up -d
```

---

### Problem 4: Site returns 502 Bad Gateway through Cloudflare domain
**Cause:** The Cloudflare tunnel can't reach the app.
**Fix:** In the Cloudflare Dashboard:
1. Go to Networks → Tunnels → doge-consulting → Configure → Public Hostnames
2. Check the Service URL. It **must** be `localhost:3000`.
3. If it says `app:3000`, change it to `localhost:3000` and save.

**Why:** The tunnel container uses `network_mode: "service:app"` which shares the app's
network namespace. So from the tunnel's perspective, the app is at `localhost:3000`.

---

### Problem 5: Browser shows "Not Secure" or HTTP doesn't redirect to HTTPS
**Cause:** Cloudflare SSL is not properly configured.
**Fix:** In the Cloudflare Dashboard for `doge-consulting.com`:
1. SSL/TLS → Overview → Set encryption mode to **Full**
2. SSL/TLS → Edge Certificates → Enable **Always Use HTTPS**

---

### Problem 6: Domain doesn't resolve / times out
**Cause:** DNS hasn't propagated yet (can take up to 24 hours, usually 5 minutes).
**Diagnose:**
```powershell
nslookup doge-consulting.com 1.1.1.1
```
If this returns IP addresses (like 104.21.x.x), DNS is propagated. Flush local DNS:
```powershell
ipconfig /flushdns
```
Then wait 2-5 minutes and retry.

If nslookup returns "Non-existent domain", the domain's DNS is not pointed to Cloudflare.
In the domain registrar, set nameservers to Cloudflare's (shown in the Cloudflare Dashboard).

---

### Problem 7: SMTP emails not sending / env vars missing
**Cause:** Container was started before `.env` had SMTP values.
**Fix:**
1. Verify `.env` has all SMTP values:
```powershell
Select-String "SMTP" C:\doge-consulting\.env
```
Should show 5 SMTP lines.

2. Restart the containers to pick up the env:
```powershell
docker compose down
docker compose up -d
```

3. Verify env is in the container:
```powershell
docker exec doge-app printenv | findstr SMTP
```

---

### Problem 8: "port is already allocated" error on startup
**Cause:** Another process is using port 3000.
**Fix:**
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with the actual PID from above)
# taskkill /PID <PID> /F

# Or stop all Docker containers and retry
docker compose down
docker stop $(docker ps -q)
docker compose up -d
```

---

### Problem 9: "image not found" or "pull access denied"
**Cause:** Docker is trying to pull instead of build.
**Fix:** Make sure you build first:
```powershell
docker compose build --no-cache
docker compose up -d
```

---

### Problem 10: Tunnel container exits immediately
**Cause:** Invalid tunnel token.
**Diagnose:**
```powershell
docker logs doge-tunnel 2>&1
```
If you see "Invalid tunnel credentials" or "failed to unmarshal tunnel credentials":
1. Check `.env` has the correct `CLOUDFLARE_TUNNEL_TOKEN`
2. Make sure the token has no extra spaces or line breaks
3. Get a fresh token from Cloudflare Dashboard → Networks → Tunnels → your tunnel → Configure → Install connector

After fixing:
```powershell
docker compose down
docker compose up -d
```

---

## Appendix A: Creating a New Cloudflare Tunnel From Scratch

Only follow this if no tunnel exists yet.

1. Log in to https://one.dash.cloudflare.com/
2. Your domain (`doge-consulting.com`) must already be added to Cloudflare
3. Go to **Networks** → **Tunnels** → **Create a tunnel**
4. Select **Cloudflared** as the connector type → **Next**
5. Name: `doge-consulting` → **Save tunnel**
6. On the "Install connector" page, you'll see a command like:
   ```
   cloudflared.exe service install eyJhIjoiMD...
   ```
   **Copy ONLY the `eyJ...` token** (everything after `install ` or `--token `).
   This is your `CLOUDFLARE_TUNNEL_TOKEN`.
   **Do NOT run the install command** — Docker runs cloudflared for you.
7. Click **Next**
8. Add a public hostname:
   - Subdomain: (leave blank for root domain)
   - Domain: `doge-consulting.com`
   - Path: (leave blank)
   - Type: `HTTP`
   - URL: `localhost:3000`
9. Click **Save tunnel**
10. Go to **SSL/TLS** → **Overview** → Set mode to **Full**
11. Go to **SSL/TLS** → **Edge Certificates** → Enable **Always Use HTTPS**
12. Put the token in your `.env` file as `CLOUDFLARE_TUNNEL_TOKEN=eyJ...`

---

## Appendix B: File Reference

These files exist in the repo and **MUST NOT be modified** by the deploying agent:

| File | Purpose | Why It Must Not Be Modified |
|------|---------|----------------------------|
| `Dockerfile` | Multi-stage build (deps→builder→runner) | Copies full node_modules for Prisma CLI. Fixes CRLF. Tested and working. |
| `docker-compose.yml` | Orchestrates app + tunnel | Uses `network_mode: "service:app"`. Reads secrets from `.env`. |
| `docker-entrypoint.sh` | Container startup script | Uses `node ./node_modules/prisma/build/index.js` for Prisma CLI. Seeds by User count. |
| `next.config.ts` | Next.js configuration | Enables standalone output via `DOCKER_BUILD=1` (set in Dockerfile). |
| `.dockerignore` | Excludes files from build context | Keeps build context small and fast. |

**The ONLY file the deploying agent creates is `.env`.**

---

## Appendix C: CI/CD Setup (GitHub Actions Self-Hosted Runner)

### How CI/CD Works

```
Developer laptop                 GitHub                    Target laptop (production)
      │                            │                              │
      │  git push master           │                              │
      ├───────────────────────────>│                              │
      │                            │  CI: test job (ubuntu)       │
      │                            │  npm ci → prisma generate    │
      │                            │  → vitest run                │
      │                            │                              │
      │                            │  if tests pass:              │
      │                            │  CD: deploy job ────────────>│
      │                            │  (runs ON target laptop)     │
      │                            │                              │  git pull
      │                            │                              │  docker compose build
      │                            │                              │  docker compose up -d
      │                            │                              │  health check
      │                            │                              │
```

- **CI (Continuous Integration)**: Runs on GitHub's free `ubuntu-latest` runners.
  Triggers on every push to `master` and every pull request. Runs `vitest` tests.
- **CD (Continuous Deployment)**: Runs on the **target laptop** via a self-hosted runner.
  Only triggers after CI passes AND only on push to `master` (not PRs).

### Prerequisites

The target laptop must already have:
1. ✅ Docker Desktop running (from Steps 1-9 above)
2. ✅ The site live at `https://doge-consulting.com` (from Steps 1-9 above)
3. ✅ The repo cloned at `C:\doge-consulting`
4. ❓ A GitHub Actions self-hosted runner (set up below)

### C.1: Install the Self-Hosted Runner on the Target Laptop

**These steps are performed ON THE TARGET LAPTOP (the production machine).**

#### C.1.1: Get the runner token from GitHub

1. Open a browser on the target laptop
2. Go to: `https://github.com/jackyzou/doge-consulting/settings/actions/runners/new`
3. If prompted, log in to GitHub with write access to the repo
4. You should see a page titled **"Add new self-hosted runner"**
5. Select:
   - Runner image: **Windows**
   - Architecture: **x64**
6. The page shows a **Download** section and a **Configure** section with commands.
   Follow the commands below (they match what the page shows):

#### C.1.2: Download and extract the runner

Open **PowerShell as Administrator** on the target laptop and run:

```powershell
# Create runner directory
New-Item -ItemType Directory -Path "C:\actions-runner" -Force
Set-Location C:\actions-runner

# Download the latest runner (check the GitHub page for the exact URL — it changes with versions)
# As of 2025, the URL looks like this (replace VERSION with what the page shows):
Invoke-WebRequest -Uri "https://github.com/actions/runner/releases/download/v2.322.0/actions-runner-win-x64-2.322.0.zip" -OutFile "actions-runner-win-x64.zip"

# Extract
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory("$PWD\actions-runner-win-x64.zip", "$PWD")
```

**NOTE:** The exact download URL and version number are shown on the GitHub page from step C.1.1.
Use the URL from that page — it will be the latest version.

#### C.1.3: Configure the runner

Still in `C:\actions-runner`:

```powershell
.\config.cmd --url https://github.com/jackyzou/doge-consulting --token YOUR_TOKEN_FROM_GITHUB_PAGE
```

**Replace `YOUR_TOKEN_FROM_GITHUB_PAGE`** with the token shown on the GitHub runner setup page
(it's in the "Configure" section, after `--token`). The token is a short alphanumeric string.

When prompted:
- **Runner group:** press Enter (use default)
- **Runner name:** press Enter (use default, usually the computer name)
- **Additional labels:** type `Windows,X64` then press Enter
- **Work folder:** press Enter (use default `_work`)

**Expected output:**
```
√ Connected to GitHub
√ Runner successfully added
√ Runner settings saved
```

#### C.1.4: Install as a Windows service (so it starts automatically)

```powershell
.\svc.cmd install
.\svc.cmd start
```

**Expected output:**
```
Service actions.runner.jackyzou-doge-consulting.COMPUTER-NAME was successfully installed
Service actions.runner.jackyzou-doge-consulting.COMPUTER-NAME successfully started
```

The runner is now running as a Windows service. It will:
- Start automatically when Windows boots
- Listen for deploy jobs from GitHub Actions
- Run the deploy steps inside `C:\doge-consulting`

#### C.1.5: Verify the runner is online

1. Go to: `https://github.com/jackyzou/doge-consulting/settings/actions/runners`
2. You should see your runner listed with a **green "Idle"** status

If it shows "Offline":
```powershell
# Check service status
Get-Service actions.runner.* | Format-List Name, Status
# If stopped, start it:
.\svc.cmd start
```

### C.2: GitHub Repository Variable (Already Set)

The repo needs a variable `DEPLOY_MODE` set to `docker`. This tells the workflow
to use the Docker deploy path.

**This is already configured.** To verify:
- Go to `https://github.com/jackyzou/doge-consulting/settings/variables/actions`
- You should see `DEPLOY_MODE` = `docker`

If it's missing, create it:
- Click "New repository variable"
- Name: `DEPLOY_MODE`
- Value: `docker`
- Click "Add variable"

### C.3: Test the CI/CD Pipeline

On the **developer laptop** (not the target laptop):

```powershell
cd C:\Users\jiaqizou\doge-consulting

# Make a small change (e.g., add a comment to any file)
echo "# CI/CD test" >> README.md
git add README.md
git commit -m "test: verify CI/CD pipeline"
git push origin master
```

Then watch the pipeline:
1. Go to `https://github.com/jackyzou/doge-consulting/actions`
2. You should see a new workflow run
3. The **test** job should run first (on ubuntu, 1-2 minutes)
4. If tests pass, the **deploy** job runs (on the target laptop, 3-5 minutes)
5. The deploy job will: `git pull` → `docker compose build --no-cache` → `docker compose up -d` → health check

**Expected final status:** Both jobs show ✅ green checkmarks.

### C.4: How Ongoing Development Works

After setup, the workflow is:

1. **Developer** writes code on the dev laptop
2. **Developer** pushes to `master` (or merges a PR)
3. **GitHub Actions CI** runs tests automatically on ubuntu
4. **If tests pass**, GitHub Actions CD runs on the target laptop:
   - Pulls latest code
   - Rebuilds Docker image
   - Restarts containers
   - Verifies health check
5. **Site is updated** at `https://doge-consulting.com` within ~5 minutes of push

No manual intervention needed on the target laptop after initial setup.

### C.5: Troubleshooting CI/CD

**Deploy job shows "Waiting for a runner":**
→ The self-hosted runner on the target laptop is offline.
→ On the target laptop, run:
```powershell
Set-Location C:\actions-runner
.\svc.cmd status
# If stopped:
.\svc.cmd start
```

**Deploy job fails with "docker: command not found":**
→ Docker Desktop is not running on the target laptop.
→ On the target laptop, start Docker Desktop and ensure it's running.

**Deploy job fails at "git pull" with auth error:**
→ The target laptop needs Git credentials configured.
→ On the target laptop:
```powershell
cd C:\doge-consulting
git config credential.helper manager
git pull origin master
# Enter GitHub credentials when prompted — they'll be saved
```

**Deploy job fails at "docker compose build":**
→ Same as build troubleshooting in the main guide above. Usually retry works.

---

## Appendix D: Complete Quick-Deploy Script

For an agent that wants to run everything in one go, here is the exact
sequence of commands. **All 3 REPLACE_THIS values must be filled in first.**

```powershell
# ── Step 1: Ensure Docker is running ──
$dockerReady = $false
for ($i = 0; $i -lt 30; $i++) {
  $result = docker info 2>&1
  if ($LASTEXITCODE -eq 0) { $dockerReady = $true; break }
  Start-Sleep -Seconds 3
}
if (-not $dockerReady) {
  Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 3
    $result = docker info 2>&1
    if ($LASTEXITCODE -eq 0) { break }
  }
}

# ── Step 2: Clone or update ──
if (-not (Test-Path C:\doge-consulting)) {
  git clone https://github.com/jackyzou/doge-consulting.git C:\doge-consulting
}
Set-Location C:\doge-consulting
git pull origin master

# ── Step 3: Create .env (FILL IN VALUES BEFORE RUNNING) ──
@"
JWT_SECRET=ce1214a1a81c5027192b7f3561b222ba54ffe23cfaecff7f9f07be9d51ec1ce87f624b75293c002a80b23703d93656f223c79668806fba006e09ec3e91983057
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=dogetech77@gmail.com
SMTP_PASS=lelfqnwaxpgxzsnn
SMTP_FROM=dogetech77@gmail.com
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoiMDg5ZjY3NTQ1ZDRmZjc2Nzc2ZTMzNzIyZGIzYjQzNjAiLCJ0IjoiMzljNGI4NTQtYTIyOS00MWM2LTg1M2YtNGUwZWRjYzkyMWIyIiwicyI6Ik5qVTJORGd3WkRrdE1qaGxNaTAwTmpFMkxUazFOMlF0T0dFd1pXTTJPV1ZrTTJabSJ9
"@ | Set-Content -Path "C:\doge-consulting\.env" -Encoding UTF8NoBOM

# ── Step 4: Create directories ──
New-Item -ItemType Directory -Path "C:\doge-consulting\data" -Force | Out-Null
New-Item -ItemType Directory -Path "C:\doge-consulting\logs" -Force | Out-Null

# ── Step 5: Remove stale database ──
Remove-Item C:\doge-consulting\data\production.db -Force -ErrorAction SilentlyContinue

# ── Step 6: Build ──
docker compose build --no-cache

# ── Step 7: Start ──
docker compose up -d

# ── Step 8: Wait for healthy ──
for ($i = 0; $i -lt 24; $i++) {
  Start-Sleep -Seconds 5
  $status = (docker inspect --format='{{.State.Health.Status}}' doge-app 2>$null)
  Write-Host "Health: $status ($($i+1)/24)"
  if ($status -eq "healthy") { break }
}

# ── Step 9: Seed ──
docker exec doge-app node prisma/seed.mjs

# ── Step 10: Verify ──
Write-Host "`n=== Verification ==="
Invoke-RestMethod http://localhost:3000/api/health
$body = '{"email":"admin@dogeconsulting.com","password":"admin123"}'
$r = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
Write-Host "Admin login: $($r.StatusCode)"
docker exec doge-app printenv | findstr SMTP
Write-Host "`n=== Deployment Complete ==="
Write-Host "Local: http://localhost:3000"
Write-Host "Public: https://doge-consulting.com"
```
