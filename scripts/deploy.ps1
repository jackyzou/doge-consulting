<#
.SYNOPSIS
    Deploy Doge Consulting to the production service directory.
.DESCRIPTION
    Pulls latest code, installs dependencies, runs migrations, builds,
    and restarts the Windows service. Run from any directory.
.PARAMETER ServicePath
    Path to the production project directory. Default: C:\doge-consulting
#>
param(
    [string]$ServicePath = $(if ($env:DOGE_SERVICE_PATH) { $env:DOGE_SERVICE_PATH } else { "C:\doge-consulting" })
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  Doge Consulting — Production Deploy"    -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# ── Validate ────────────────────────────────────────────────────
if (-not (Test-Path $ServicePath)) {
    Write-Host "ERROR: Service directory not found: $ServicePath" -ForegroundColor Red
    Write-Host "Clone the repo first:  git clone <repo-url> $ServicePath"
    exit 1
}

if (-not (Test-Path (Join-Path $ServicePath ".env.local"))) {
    Write-Host "WARNING: .env.local not found in $ServicePath" -ForegroundColor Yellow
    Write-Host "Create it from .env.production.example before first run.`n"
}

Push-Location $ServicePath

try {
    # ── Pull latest ─────────────────────────────────────────────
    Write-Step "Pulling latest code"
    git pull origin master

    # ── Dependencies ────────────────────────────────────────────
    Write-Step "Installing dependencies"
    npm ci

    # ── Prisma ──────────────────────────────────────────────────
    Write-Step "Generating Prisma client"
    npx prisma generate

    Write-Step "Running database migrations"
    npx prisma migrate deploy

    # ── Build ───────────────────────────────────────────────────
    Write-Step "Building Next.js"
    npm run build

    # ── Restart service ─────────────────────────────────────────
    Write-Step "Restarting service"
    $svc = Get-Service DogeConsulting -ErrorAction SilentlyContinue
    if ($svc) {
        Restart-Service DogeConsulting -Force
        Write-Host "Service restarted." -ForegroundColor Green

        # Wait for health check
        Write-Step "Running health check"
        $healthy = $false
        for ($i = 0; $i -lt 10; $i++) {
            Start-Sleep -Seconds 3
            try {
                $resp = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 5
                if ($resp.status -eq "ok") {
                    $healthy = $true
                    break
                }
            } catch {
                Write-Host "  Waiting... ($($i+1)/10)" -ForegroundColor Gray
            }
        }

        if ($healthy) {
            Write-Host "`n  Deploy successful!" -ForegroundColor Green
        } else {
            Write-Host "`n  Health check failed — check logs at $ServicePath\logs\" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Service 'DogeConsulting' not installed." -ForegroundColor Yellow
        Write-Host "Run scripts\install-service.ps1 to create it."
    }
}
finally {
    Pop-Location
}
