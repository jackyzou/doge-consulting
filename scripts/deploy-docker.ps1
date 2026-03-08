<#
.SYNOPSIS
    Deploy Doge Consulting via Docker on the target laptop.
.DESCRIPTION
    Hard-resets to origin/master, nukes old Docker images, rebuilds from scratch.
    Guarantees the latest code is running. Copy-paste into PowerShell.
#>
$ErrorActionPreference = "Stop"

# Find project directory
$paths = @("C:\doge-consulting", "$env:USERPROFILE\doge-consulting", (Get-Location).Path)
$ServicePath = $paths | Where-Object { Test-Path (Join-Path $_ "docker-compose.yml") } | Select-Object -First 1
if (-not $ServicePath) { Write-Host "ERROR: Can't find doge-consulting directory with docker-compose.yml" -ForegroundColor Red; exit 1 }

Set-Location $ServicePath
Write-Host "`n=== Doge Consulting Deploy ===" -ForegroundColor Cyan

# 1. Hard-reset to latest remote code
Write-Host "`n[1/6] Fetching and hard-resetting to origin/master..." -ForegroundColor Yellow
git fetch origin
git reset --hard origin/master
$commit = git log --oneline -1
Write-Host "  Commit: $commit" -ForegroundColor Gray

# 2. Stop containers and REMOVE old images
Write-Host "`n[2/6] Stopping containers and removing old images..." -ForegroundColor Yellow
docker compose down --rmi all 2>$null
docker system prune -f 2>$null

# 3. Rebuild from scratch (no cache)
Write-Host "`n[3/6] Building Docker image from scratch (3-10 min)..." -ForegroundColor Yellow
docker compose build --no-cache

# 4. Start with force-recreate (no reuse of old containers)
Write-Host "`n[4/6] Starting fresh containers..." -ForegroundColor Yellow
docker compose up -d --force-recreate

# 5. Show live logs for 10 seconds so user can see entrypoint progress
Write-Host "`n[5/6] Entrypoint running (migrations + seed)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
docker compose logs --tail 30 app

# 6. Health check
Write-Host "`n[6/6] Waiting for health check..." -ForegroundColor Gray
$ok = $false
for ($i = 1; $i -le 30; $i++) {
    Start-Sleep -Seconds 5
    try {
        $r = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 5
        if ($r.status -eq "ok") { $ok = $true; break }
    } catch { Write-Host "  Waiting... ($i/30)" -ForegroundColor Gray }
}

if ($ok) {
    Write-Host "`n✅ Deploy successful!" -ForegroundColor Green
    Write-Host "  Local:  http://localhost:3000" -ForegroundColor Green
    Write-Host "  Live:   https://doge-consulting.com" -ForegroundColor Green
    Write-Host "  Commit: $commit" -ForegroundColor Green
    docker compose logs --tail 10 app
} else {
    Write-Host "`n❌ Health check failed after 150 seconds. Logs:" -ForegroundColor Red
    docker compose logs --tail 80 app
    exit 1
}
