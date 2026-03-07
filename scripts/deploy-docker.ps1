<#
.SYNOPSIS
    Deploy Doge Consulting via Docker on the target laptop.
.DESCRIPTION
    git pull → docker compose build → docker compose up.
    Works on low-end machines. Copy-paste into PowerShell.
#>
$ErrorActionPreference = "Stop"

# Find project directory
$paths = @("C:\doge-consulting", "$env:USERPROFILE\doge-consulting", (Get-Location).Path)
$ServicePath = $paths | Where-Object { Test-Path (Join-Path $_ "docker-compose.yml") } | Select-Object -First 1
if (-not $ServicePath) { Write-Host "ERROR: Can't find doge-consulting directory with docker-compose.yml" -ForegroundColor Red; exit 1 }

Set-Location $ServicePath
Write-Host "`n=== Doge Consulting Deploy ===" -ForegroundColor Cyan

# 1. Pull
Write-Host "`n[1/4] Pulling latest code..." -ForegroundColor Yellow
git pull origin master

# 2. Stop old
Write-Host "`n[2/4] Stopping old containers..." -ForegroundColor Yellow
docker compose down 2>$null

# 3. Build
Write-Host "`n[3/4] Building Docker image (3-8 min on low-end)..." -ForegroundColor Yellow
docker compose build

# 4. Start
Write-Host "`n[4/4] Starting..." -ForegroundColor Yellow
docker compose up -d

# Health check
Write-Host "`nWaiting for health check..." -ForegroundColor Gray
$ok = $false
for ($i = 1; $i -le 20; $i++) {
    Start-Sleep -Seconds 5
    try {
        $r = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 5
        if ($r.status -eq "ok") { $ok = $true; break }
    } catch { Write-Host "  Waiting... ($i/20)" -ForegroundColor Gray }
}

if ($ok) {
    Write-Host "`n✅ Deploy successful! Site live at http://localhost:3000" -ForegroundColor Green
    docker compose logs --tail 20 app
} else {
    Write-Host "`n❌ Health check failed. Logs:" -ForegroundColor Red
    docker compose logs --tail 50 app
    exit 1
}
