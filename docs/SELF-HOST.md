# Self-Hosting Guide — Doge Consulting

Host the Doge Consulting website on your own Windows PC with automatic HTTPS,
CI/CD, and zero monthly hosting costs.

## Architecture Overview

```
Internet → Cloudflare Tunnel (HTTPS) → localhost:3000 → Next.js (NSSM service)
                                                          ↓
GitHub Push → Actions Runner (self-hosted) → Build & Test → Restart Service
```

**Three Windows services run on the PC:**
| Service | Purpose | Auto-start |
|---------|---------|------------|
| `DogeConsulting` | Next.js production server | ✅ On boot |
| `cloudflared` | Cloudflare Tunnel (HTTPS) | ✅ On boot |
| `actions.runner.*` | GitHub Actions CI/CD runner | ✅ On boot |

---

## Prerequisites

- **Windows 10/11** (64-bit)
- **Node.js 20+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)
- **GitHub account** with repo access
- **Cloudflare account** (free) — [Sign up](https://dash.cloudflare.com/sign-up)

---

## Step 1 — Clone & Configure

```powershell
# Clone the repository
git clone https://github.com/YOUR_ORG/doge-consulting.git C:\doge-consulting
cd C:\doge-consulting

# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate
```

### Create `.env.local`

Copy the template and fill in your values:

```powershell
Copy-Item .env.production.example .env.local
notepad .env.local
```

**Required variables:**

| Variable | How to generate |
|----------|----------------|
| `JWT_SECRET` | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `DATABASE_PATH` | `C:/doge-consulting/data/production.db` |
| `DATABASE_URL` | `file:C:/doge-consulting/data/production.db` |

SMTP and Airwallex variables are optional — fill them in if you need
email notifications or payment processing.

### Initialize the database

```powershell
# Create data directory
New-Item -ItemType Directory -Path data -Force

# Run migrations (creates the database)
npx prisma migrate deploy

# Seed initial data (admin user, products, etc.)
node prisma/seed.mjs
```

### Build & test locally

```powershell
npm run build
npx next start -p 3000

# Visit http://localhost:3000 — verify it works, then Ctrl+C to stop
```

---

## Step 2 — Install as Windows Service

This creates a Windows service so the server starts automatically on boot
and restarts if it crashes.

```powershell
# Run as Administrator!
powershell -ExecutionPolicy Bypass -File scripts\install-service.ps1
```

**What this does:**
1. Downloads [NSSM](https://nssm.cc) (Non-Sucking Service Manager)
2. Creates the `DogeConsulting` Windows service
3. Configures auto-restart, logging, and environment variables
4. Starts the server

**Verify:**
```powershell
Get-Service DogeConsulting          # Should show "Running"
Invoke-RestMethod http://localhost:3000/api/health   # Should return status: ok
```

**Useful commands:**
```powershell
Restart-Service DogeConsulting      # Restart
Stop-Service DogeConsulting         # Stop
Get-Content C:\doge-consulting\logs\stdout.log -Tail 50   # View logs
```

---

## Step 3 — Expose to the Internet (Cloudflare Tunnel)

Cloudflare Tunnel creates a secure outbound-only connection from your PC
to Cloudflare's network. No port forwarding, no firewall changes needed.

### Quick start (free, no domain)

```powershell
# Run the setup script
powershell -ExecutionPolicy Bypass -File scripts\setup-tunnel.ps1
```

Select "Quick tunnel" for an instant public URL like
`https://random-words.trycloudflare.com`. The URL changes each restart.

### With a custom domain ($2-10/year)

1. **Buy a domain** — cheapest options:
   - [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/): `.xyz` ~$2/yr
   - [Porkbun](https://porkbun.com/): `.xyz` ~$2/yr, `.life` ~$2/yr
   - [Namecheap](https://namecheap.com/): `.xyz` ~$1/yr first year

2. **Add to Cloudflare** — Go to [Cloudflare Dashboard](https://dash.cloudflare.com),
   click "Add a site", follow the DNS setup instructions.

3. **Create a named tunnel:**

```powershell
# Login to Cloudflare (opens browser)
cloudflared tunnel login

# Create the tunnel
cloudflared tunnel create doge-consulting

# Create DNS route (replace with your domain)
cloudflared tunnel route dns doge-consulting yourdomain.com
```

4. **Configure the tunnel** — create `$env:USERPROFILE\.cloudflared\config.yml`:

```yaml
tunnel: <TUNNEL_ID>
credentials-file: C:\Users\YourUser\.cloudflared\<TUNNEL_ID>.json
ingress:
  - hostname: yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

5. **Test, then install as service:**

```powershell
# Test first
cloudflared tunnel run doge-consulting

# If it works, install as a Windows service (auto-starts on boot)
cloudflared service install
```

6. **Verify:**
```powershell
Get-Service cloudflared   # Should show "Running"
# Visit https://yourdomain.com — should show the site!
```

---

## Step 4 — CI/CD (GitHub Actions Self-Hosted Runner)

A self-hosted runner executes GitHub Actions workflows directly on your PC.
When you push code, it automatically tests, builds, and deploys.

### Install the runner

1. Go to your repo on GitHub → **Settings** → **Actions** → **Runners**
2. Click **"New self-hosted runner"**
3. Select **Windows** / **x64**
4. Follow the displayed commands:

```powershell
# Create a directory for the runner
mkdir C:\actions-runner; cd C:\actions-runner

# Download (use the URL from GitHub's instructions)
Invoke-WebRequest -Uri <URL_FROM_GITHUB> -OutFile actions-runner-win-x64.zip
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory("$PWD\actions-runner-win-x64.zip", "$PWD")

# Configure
.\config.cmd --url https://github.com/YOUR_ORG/doge-consulting --token <TOKEN>

# Install as Windows service (auto-starts on boot)
.\svc.cmd install
.\svc.cmd start
```

### Verify CI/CD

```powershell
Get-Service actions.runner.*   # Should show "Running"
```

Push a commit to the `master` branch — the workflow in
`.github/workflows/ci-deploy.yml` will:
1. Check out the code
2. Run `npm ci` and `npx vitest run`
3. Pull latest code to `C:\doge-consulting`
4. Build and restart the service
5. Run a health check

---

## Step 5 — Prevent Sleep

Keep the PC awake 24/7 so the server stays online:

```powershell
# Run as Administrator!
powershell -ExecutionPolicy Bypass -File scripts\prevent-sleep.ps1
```

**What this does:**
- Disables sleep and hibernate (on AC power)
- Disables display timeout
- Sets lid-close action to "do nothing"

**Important:** Keep the laptop **plugged in** at all times.

---

## Step 6 — Automated Backups

Set up daily SQLite database backups:

```powershell
# Manual backup
powershell -ExecutionPolicy Bypass -File scripts\backup-db.ps1

# Schedule daily at 2 AM (run as Administrator)
schtasks /create /tn "DogeConsulting-Backup" `
  /tr "powershell -ExecutionPolicy Bypass -File C:\doge-consulting\scripts\backup-db.ps1" `
  /sc daily /st 02:00 /ru SYSTEM /f
```

Backups are saved to `C:\doge-consulting\data\backups\` and automatically
cleaned up after 30 days.

---

## Security Checklist

- [ ] **JWT_SECRET** is a strong random value (not the default)
- [ ] `.env.local` is NOT committed to git
- [ ] Cloudflare Tunnel is used (no direct port exposure)
- [ ] Windows Firewall is ON (default)
- [ ] Windows Update is enabled
- [ ] Database backups are scheduled
- [ ] GitHub repo is private (or secrets are in `.env.local`)

---

## Troubleshooting

### Server won't start
```powershell
# Check service status
Get-Service DogeConsulting
nssm status DogeConsulting

# Check logs
Get-Content C:\doge-consulting\logs\stderr.log -Tail 100

# Try running manually
cd C:\doge-consulting
$env:NODE_ENV = "production"
node node_modules\next\dist\bin\next start -p 3000
```

### Tunnel not working
```powershell
# Check service
Get-Service cloudflared

# Check tunnel status
cloudflared tunnel info doge-consulting

# Test locally first
Invoke-RestMethod http://localhost:3000/api/health
```

### CI/CD runner offline
```powershell
# Check service
Get-Service actions.runner.*

# Restart runner
Get-Service actions.runner.* | Restart-Service

# Check on GitHub
# Repo → Settings → Actions → Runners → should show "Idle"
```

### Database issues
```powershell
# Check database file exists
Test-Path $env:DATABASE_PATH

# Run migrations manually
cd C:\doge-consulting
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

---

## Estimated Costs

| Item | Cost |
|------|------|
| Cloudflare Tunnel | Free |
| Cloudflare DNS | Free |
| GitHub Actions (self-hosted runner) | Free |
| Domain (`.xyz`) | ~$2/year |
| Electricity | ~$5-15/month |
| **Total** | **~$2/year + electricity** |

---

## Quick Reference

```powershell
# Service management
Restart-Service DogeConsulting
Stop-Service DogeConsulting
Get-Service DogeConsulting

# View logs
Get-Content C:\doge-consulting\logs\stdout.log -Tail 50 -Wait

# Manual deploy
powershell -ExecutionPolicy Bypass -File C:\doge-consulting\scripts\deploy.ps1

# Manual backup
powershell -ExecutionPolicy Bypass -File C:\doge-consulting\scripts\backup-db.ps1

# Health check
Invoke-RestMethod http://localhost:3000/api/health
```
