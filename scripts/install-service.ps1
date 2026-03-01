<#
.SYNOPSIS
    Install Doge Consulting as a Windows service using NSSM.
.DESCRIPTION
    Downloads NSSM (Non-Sucking Service Manager), creates a Windows service
    that runs the Next.js production server, and configures auto-restart,
    logging, and environment variables.
.NOTES
    Must be run as Administrator.
#>
param(
    [string]$ProjectDir  = $(if ($env:DOGE_SERVICE_PATH) { $env:DOGE_SERVICE_PATH } else { "C:\doge-consulting" }),
    [string]$ServiceName = "DogeConsulting",
    [int]$Port           = 3000
)

$ErrorActionPreference = "Stop"

# ── Check admin privileges ──────────────────────────────────────
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator." -ForegroundColor Red
    Write-Host "Right-click PowerShell → 'Run as Administrator', then try again."
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  Doge Consulting — Service Installer"    -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# ── Validate project directory ──────────────────────────────────
if (-not (Test-Path (Join-Path $ProjectDir "package.json"))) {
    Write-Host "ERROR: package.json not found in $ProjectDir" -ForegroundColor Red
    Write-Host "Clone the repository first:  git clone <repo-url> $ProjectDir"
    exit 1
}

# ── Install NSSM ───────────────────────────────────────────────
$nssmExe = $null

# Check if NSSM is already installed
$existing = Get-Command nssm -ErrorAction SilentlyContinue
if ($existing) {
    $nssmExe = $existing.Source
    Write-Host "NSSM already installed at $nssmExe" -ForegroundColor Green
} else {
    Write-Host "Downloading NSSM..." -ForegroundColor Yellow
    $nssmVersion = "2.24"
    $nssmUrl = "https://nssm.cc/release/nssm-$nssmVersion.zip"
    $nssmZip = Join-Path $env:TEMP "nssm.zip"
    $nssmExtract = Join-Path $env:TEMP "nssm-$nssmVersion"

    try {
        Invoke-WebRequest -Uri $nssmUrl -OutFile $nssmZip -UseBasicParsing
    } catch {
        Write-Host "Failed to download NSSM. Download manually from https://nssm.cc" -ForegroundColor Red
        Write-Host "Place nssm.exe in your PATH and re-run this script."
        exit 1
    }

    Expand-Archive -Path $nssmZip -DestinationPath $env:TEMP -Force
    $nssmExe = Join-Path $nssmExtract "win64\nssm.exe"

    if (-not (Test-Path $nssmExe)) {
        Write-Host "ERROR: Could not find nssm.exe after extraction" -ForegroundColor Red
        exit 1
    }

    # Copy to a permanent location
    $nssmDest = "C:\tools\nssm.exe"
    New-Item -ItemType Directory -Path "C:\tools" -Force | Out-Null
    Copy-Item $nssmExe $nssmDest -Force
    $nssmExe = $nssmDest

    # Add to PATH if not already there
    $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    if ($machinePath -notlike "*C:\tools*") {
        [Environment]::SetEnvironmentVariable("Path", "$machinePath;C:\tools", "Machine")
        $env:Path += ";C:\tools"
        Write-Host "Added C:\tools to system PATH" -ForegroundColor Green
    }

    Write-Host "NSSM installed to $nssmExe" -ForegroundColor Green

    # Cleanup
    Remove-Item $nssmZip -ErrorAction SilentlyContinue
}

# ── Create directories ──────────────────────────────────────────
$logDir  = Join-Path $ProjectDir "logs"
$dataDir = Join-Path $ProjectDir "data"
New-Item -ItemType Directory -Path $logDir  -Force | Out-Null
New-Item -ItemType Directory -Path $dataDir -Force | Out-Null

# ── Find Node.js ────────────────────────────────────────────────
$nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodePath) {
    Write-Host "ERROR: Node.js not found in PATH. Install Node.js 20+ first." -ForegroundColor Red
    exit 1
}
Write-Host "Node.js: $nodePath" -ForegroundColor Gray

# ── Remove existing service if present ──────────────────────────
$existingSvc = Get-Service $ServiceName -ErrorAction SilentlyContinue
if ($existingSvc) {
    Write-Host "Removing existing service '$ServiceName'..." -ForegroundColor Yellow
    & $nssmExe stop $ServiceName 2>$null
    & $nssmExe remove $ServiceName confirm
    Start-Sleep -Seconds 2
}

# ── Determine the Next.js binary path ──────────────────────────
$nextBin = Join-Path $ProjectDir "node_modules\next\dist\bin\next"
if (-not (Test-Path $nextBin)) {
    Write-Host "Next.js binary not found. Running npm install..." -ForegroundColor Yellow
    Push-Location $ProjectDir
    npm ci
    Pop-Location
}

# ── Install service ─────────────────────────────────────────────
Write-Host "`nInstalling service '$ServiceName'..." -ForegroundColor Cyan

& $nssmExe install $ServiceName $nodePath
& $nssmExe set $ServiceName AppParameters   "`"$nextBin`" start -p $Port"
& $nssmExe set $ServiceName AppDirectory    $ProjectDir
& $nssmExe set $ServiceName Description     "Doge Consulting — Next.js production server"
& $nssmExe set $ServiceName DisplayName     "Doge Consulting Web Server"
& $nssmExe set $ServiceName Start           SERVICE_AUTO_START

# Environment variables
& $nssmExe set $ServiceName AppEnvironmentExtra "NODE_ENV=production" "PORT=$Port"

# Logging
& $nssmExe set $ServiceName AppStdout       (Join-Path $logDir "stdout.log")
& $nssmExe set $ServiceName AppStderr       (Join-Path $logDir "stderr.log")
& $nssmExe set $ServiceName AppRotateFiles  1
& $nssmExe set $ServiceName AppRotateBytes  10485760  # 10 MB

# Auto-restart on failure (wait 10s between restarts)
& $nssmExe set $ServiceName AppThrottle     10000
& $nssmExe set $ServiceName AppExit Default Restart

Write-Host "Service installed successfully!" -ForegroundColor Green

# ── Pre-flight: build if needed ─────────────────────────────────
$nextDir = Join-Path $ProjectDir ".next"
if (-not (Test-Path $nextDir)) {
    Write-Host "`nNo build found. Building Next.js..." -ForegroundColor Yellow
    Push-Location $ProjectDir
    npx prisma generate
    npx prisma migrate deploy
    npm run build
    Pop-Location
}

# ── Start service ───────────────────────────────────────────────
Write-Host "`nStarting service..." -ForegroundColor Cyan
Start-Service $ServiceName

Start-Sleep -Seconds 5
$svc = Get-Service $ServiceName
Write-Host "Service status: $($svc.Status)" -ForegroundColor $(if ($svc.Status -eq "Running") { "Green" } else { "Red" })

if ($svc.Status -eq "Running") {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  Server running at http://localhost:$Port" -ForegroundColor Green
    Write-Host "  Logs: $logDir"                            -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    Write-Host "Useful commands:"
    Write-Host "  Restart:  Restart-Service $ServiceName"
    Write-Host "  Stop:     Stop-Service $ServiceName"
    Write-Host "  Status:   Get-Service $ServiceName"
    Write-Host "  Logs:     Get-Content $logDir\stdout.log -Tail 50"
    Write-Host "  Remove:   nssm remove $ServiceName confirm"
}
