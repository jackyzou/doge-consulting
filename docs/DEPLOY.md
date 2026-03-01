# DEPLOY.md — Agent Deployment Runbook

> **Audience**: An AI agent (or human following exact steps) deploying
> Doge Consulting onto a fresh Windows 10/11 laptop.
> Every command is PowerShell. Run them **in order**. Do not skip steps.

---

## 0. Pre-flight Checks

Verify the target machine meets requirements before proceeding.

```powershell
# Must be Windows 10+ x64
[System.Environment]::OSVersion.Version
[System.Environment]::Is64BitOperatingSystem  # must be True

# Node.js 20+ must be installed
node --version   # expected: v20.x.x or v22.x.x

# Git must be installed
git --version

# npm must be available
npm --version
```

**If Node.js is missing**, install it:
```powershell
winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
# Close and reopen the terminal after installing
```

**If Git is missing**, install it:
```powershell
winget install Git.Git --accept-package-agreements --accept-source-agreements
# Close and reopen the terminal after installing
```

---

## 1. Clone the Repository

```powershell
git clone https://github.com/jackyzou/doge-consulting.git C:\doge-consulting
cd C:\doge-consulting
git checkout master
```

---

## 2. Create Production Environment File

Create `C:\doge-consulting\.env.local` with the contents below.
Replace placeholder values as noted.

```powershell
# Generate a random JWT secret
$jwtSecret = node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Write .env.local
@"
NODE_ENV=production
JWT_SECRET=$jwtSecret
DATABASE_PATH=C:/doge-consulting/data/production.db
DATABASE_URL=file:C:/doge-consulting/data/production.db
"@ | Set-Content -Path "C:\doge-consulting\.env.local" -Encoding UTF8
```

> **Optional**: Append SMTP and Airwallex vars if needed. See
> `.env.production.example` for the full list. The app runs fine
> without them — emails log to console, payments run in demo mode.

---

## 3. Create Data Directories

```powershell
New-Item -ItemType Directory -Path "C:\doge-consulting\data"    -Force
New-Item -ItemType Directory -Path "C:\doge-consulting\data\backups" -Force
New-Item -ItemType Directory -Path "C:\doge-consulting\logs"    -Force
```

---

## 4. Install Dependencies & Generate Prisma Client

```powershell
cd C:\doge-consulting
npm ci
npx prisma generate
```

---

## 5. Initialize the Database

```powershell
cd C:\doge-consulting

# Run all migrations (creates the SQLite DB at DATABASE_PATH)
npx prisma migrate deploy

# Seed with admin user, demo customer, products, sample data
node prisma/seed.mjs
```

**Seeded credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dogeconsulting.com` | `admin123` |
| Customer | `sarah@example.com` | `user123` |

> ⚠️ **Change the admin password** after first login in production.

---

## 6. Build the Application

```powershell
cd C:\doge-consulting
npm run build
```

This produces a standalone build in `.next/`. Expect it to take 1-3 minutes.

---

## 7. Smoke Test (Manual Start)

Start the server manually to verify everything works before installing as a service.

```powershell
cd C:\doge-consulting
$env:NODE_ENV = "production"
npx next start -p 3000
```

In a **separate terminal**, verify:

```powershell
# Health check — should return { "status": "ok", ... }
Invoke-RestMethod http://localhost:3000/api/health

# Homepage — should return HTTP 200
(Invoke-WebRequest http://localhost:3000 -UseBasicParsing).StatusCode
```

Once verified, stop the manual server with `Ctrl+C`.

---

## 8. Install as a Windows Service (NSSM)

This step makes the app start automatically on boot and restart on crash.
**Must be run in an Administrator PowerShell.**

```powershell
# Open an Administrator PowerShell, then:
cd C:\doge-consulting
powershell -ExecutionPolicy Bypass -File scripts\install-service.ps1
```

**What the script does:**
1. Downloads NSSM to `C:\tools\nssm.exe`
2. Creates Windows service `DogeConsulting` running `node next start -p 3000`
3. Sets `NODE_ENV=production`, `PORT=3000`
4. Configures auto-restart on failure, stdout/stderr log rotation (10 MB)
5. Starts the service

**Verify the service is running:**

```powershell
Get-Service DogeConsulting
# Expected: Status = Running

Invoke-RestMethod http://localhost:3000/api/health
# Expected: { "status": "ok", ... }
```

**Service commands:**
```powershell
Restart-Service DogeConsulting
Stop-Service DogeConsulting
Start-Service DogeConsulting
Get-Content C:\doge-consulting\logs\stdout.log -Tail 50
Get-Content C:\doge-consulting\logs\stderr.log -Tail 50
```

---

## 9. Expose to the Internet (Cloudflare Tunnel)

### Option A — Quick Tunnel (free, no domain, URL changes on restart)

```powershell
# Install cloudflared
winget install Cloudflare.cloudflared --accept-package-agreements --accept-source-agreements

# Start a quick tunnel (prints the public URL)
cloudflared tunnel --url http://localhost:3000
```

The printed URL (e.g. `https://random-words.trycloudflare.com`) is your
public site. **This URL changes every restart** — fine for testing,
not for production.

### Option B — Named Tunnel (permanent URL with a custom domain)

Requires: a domain ($2-10/yr from Cloudflare Registrar, Porkbun, or
Namecheap) added to a free Cloudflare account.

```powershell
# 1. Install cloudflared (if not done above)
winget install Cloudflare.cloudflared --accept-package-agreements --accept-source-agreements

# 2. Authenticate (opens browser)
cloudflared tunnel login

# 3. Create tunnel
cloudflared tunnel create doge-consulting
# Note the Tunnel ID (UUID) printed

# 4. Create the config file
$tunnelId = "<PASTE_TUNNEL_ID_HERE>"
$configDir = "$env:USERPROFILE\.cloudflared"
New-Item -ItemType Directory -Path $configDir -Force

@"
tunnel: $tunnelId
credentials-file: $configDir\$tunnelId.json
ingress:
  - hostname: <YOUR_DOMAIN>
    service: http://localhost:3000
  - service: http_status:404
"@ | Set-Content -Path "$configDir\config.yml" -Encoding UTF8

# 5. Create DNS record
cloudflared tunnel route dns doge-consulting <YOUR_DOMAIN>

# 6. Test
cloudflared tunnel run doge-consulting
# Verify your domain loads the site in a browser

# 7. Install as Windows service (auto-starts on boot)
cloudflared service install

# 8. Verify
Get-Service cloudflared
# Expected: Status = Running
```

---

## 10. Prevent Sleep

**Must be run in an Administrator PowerShell.**

```powershell
cd C:\doge-consulting
powershell -ExecutionPolicy Bypass -File scripts\prevent-sleep.ps1
```

This configures:
- Sleep timeout → Never (AC power)
- Hibernate timeout → Never (AC power)
- Display timeout → Never (AC power)
- Lid close action → Do nothing (AC power)

**Keep the laptop plugged in at all times.**

---

## 11. Install GitHub Actions Self-Hosted Runner

This enables CI/CD: push to `master` → tests run → auto-deploy.

```powershell
# 1. Create runner directory
New-Item -ItemType Directory -Path "C:\actions-runner" -Force
cd C:\actions-runner

# 2. Download runner (check GitHub for latest version URL)
#    Go to: https://github.com/jackyzou/doge-consulting/settings/actions/runners/new
#    Select: Windows, x64
#    Copy the download URL and token from the page

Invoke-WebRequest -Uri <RUNNER_DOWNLOAD_URL> -OutFile actions-runner-win-x64.zip
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory("$PWD\actions-runner-win-x64.zip", "$PWD")

# 3. Configure (use the token from the GitHub settings page)
.\config.cmd --url https://github.com/jackyzou/doge-consulting --token <RUNNER_TOKEN> --name "laptop-runner" --labels "self-hosted,Windows,X64" --unattended

# 4. Install and start as a Windows service
.\svc.cmd install
.\svc.cmd start
```

**Verify:**
```powershell
Get-Service actions.runner.*
# Expected: Status = Running
```

Then check GitHub: **Repo → Settings → Actions → Runners** — the runner
should appear as **Idle**.

**Set the deployment path** (optional, defaults to `C:\doge-consulting`):
Go to **Repo → Settings → Variables → Actions** and create a repository
variable:
- Name: `DOGE_SERVICE_PATH`
- Value: `C:\doge-consulting`

---

## 12. Schedule Database Backups

**Must be run in an Administrator PowerShell.**

```powershell
schtasks /create /tn "DogeConsulting-Backup" `
  /tr "powershell -ExecutionPolicy Bypass -File C:\doge-consulting\scripts\backup-db.ps1" `
  /sc daily /st 02:00 /ru SYSTEM /f
```

Backups are stored in `C:\doge-consulting\data\backups\` with 30-day retention.

Manual backup:
```powershell
powershell -ExecutionPolicy Bypass -File C:\doge-consulting\scripts\backup-db.ps1
```

---

## 13. Final Verification Checklist

Run each check and confirm the expected result.

```powershell
# 1. App service is running
(Get-Service DogeConsulting).Status -eq "Running"

# 2. Health endpoint responds
(Invoke-RestMethod http://localhost:3000/api/health).status -eq "ok"

# 3. Homepage loads
(Invoke-WebRequest http://localhost:3000 -UseBasicParsing).StatusCode -eq 200

# 4. Login works
$loginBody = '{"email":"admin@dogeconsulting.com","password":"admin123"}'
$loginResp = Invoke-WebRequest -Uri http://localhost:3000/api/auth/login -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
$loginResp.StatusCode -eq 200

# 5. Tunnel service is running (skip if using quick tunnel)
(Get-Service cloudflared -ErrorAction SilentlyContinue).Status -eq "Running"

# 6. CI/CD runner is running
(Get-Service actions.runner.* -ErrorAction SilentlyContinue).Status -eq "Running"

# 7. Sleep is disabled
powercfg /query SCHEME_CURRENT SUB_SLEEP STANDBYIDLE | Select-String "0x00000000"

# 8. Backup task is scheduled
schtasks /query /tn "DogeConsulting-Backup" /fo LIST | Select-String "Ready"
```

---

## Appendix: CI/CD Pipeline Summary

The workflow at `.github/workflows/ci-deploy.yml` triggers on every push
to `master`. It runs on the self-hosted runner and performs:

1. `npm ci` — install dependencies
2. `npx prisma generate` — generate Prisma client
3. `npx vitest run` — run all 163 unit tests
4. `git pull` in `C:\doge-consulting` — fetch latest code
5. `npm ci` + `npx prisma generate` + `npx prisma migrate deploy` — update deps & DB
6. `npm run build` — production build
7. `Restart-Service DogeConsulting` — restart the app
8. Health check loop (30s timeout) — verify the deploy succeeded

If any step fails, the workflow stops and reports failure on GitHub.

---

## Appendix: Directory Layout on Target Machine

```
C:\doge-consulting\           ← project root (git clone)
├── .env.local                ← production secrets (NOT in git)
├── .next\                    ← build output
├── data\
│   ├── production.db         ← SQLite database
│   └── backups\              ← daily backups
├── logs\
│   ├── stdout.log            ← app stdout (rotated at 10 MB)
│   └── stderr.log            ← app stderr (rotated at 10 MB)
├── node_modules\
├── prisma\
│   └── schema.prisma
├── scripts\
│   ├── deploy.ps1
│   ├── install-service.ps1
│   ├── setup-tunnel.ps1
│   ├── prevent-sleep.ps1
│   └── backup-db.ps1
└── ...

C:\tools\
├── nssm.exe                  ← service manager

C:\actions-runner\            ← GitHub Actions runner

%USERPROFILE%\.cloudflared\   ← Cloudflare tunnel config & credentials
```

---

## Appendix: Troubleshooting

| Symptom | Diagnosis | Fix |
|---------|-----------|-----|
| Service won't start | Check `logs\stderr.log` | Fix the error, then `Restart-Service DogeConsulting` |
| Port 3000 already in use | `netstat -ano \| findstr :3000` | Kill the PID: `taskkill /F /PID <pid>` |
| Health check returns 503 | Database unreachable | Verify `DATABASE_PATH` in `.env.local`, run `npx prisma migrate deploy` |
| Build fails with native addon error | `better-sqlite3` compilation issue | Ensure `npm ci` completed without errors; install Visual Studio Build Tools if needed: `npm install -g windows-build-tools` |
| Tunnel gives 502 | App not running on localhost:3000 | Start the service first: `Start-Service DogeConsulting` |
| Runner shows offline on GitHub | Service crashed | `Get-Service actions.runner.* \| Restart-Service` |
| PC went to sleep | Power settings reset after Windows Update | Re-run `scripts\prevent-sleep.ps1` |
