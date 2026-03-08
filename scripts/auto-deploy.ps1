<#
.SYNOPSIS
    Auto-deploy listener for Doge Consulting.
    Polls GitHub Actions for successful CI runs and deploys automatically.

.DESCRIPTION
    Run this script on the target deployment PC. It:
    1. Polls GitHub every 60 seconds for new successful workflow runs on master
    2. When a new successful run is detected, pulls code and rebuilds Docker
    3. Logs all activity to logs/auto-deploy.log

    Prerequisites:
    - gh CLI installed and authenticated (gh auth login)
    - Docker Desktop running
    - Project cloned at C:\doge-consulting (or set -ServicePath)

.PARAMETER ServicePath
    Path to the project directory. Default: C:\doge-consulting

.PARAMETER PollInterval
    Seconds between GitHub API polls. Default: 60

.EXAMPLE
    .\scripts\auto-deploy.ps1
    .\scripts\auto-deploy.ps1 -ServicePath "D:\doge-consulting" -PollInterval 30
#>
param(
    [string]$ServicePath = $(if (Test-Path "C:\doge-consulting") { "C:\doge-consulting" } else { $PSScriptRoot + "\.." }),
    [int]$PollInterval = 60
)

$ErrorActionPreference = "Continue"
$LogDir = Join-Path $ServicePath "logs"
$LogFile = Join-Path $LogDir "auto-deploy.log"
$StateFile = Join-Path $LogDir ".last-deployed-run-id"

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

function Write-Log($msg, $color = "White") {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] $msg"
    Write-Host $line -ForegroundColor $color
    Add-Content -Path $LogFile -Value $line
}

function Get-LastDeployedRunId {
    if (Test-Path $StateFile) { return (Get-Content $StateFile -Raw).Trim() }
    return ""
}

function Set-LastDeployedRunId($id) {
    Set-Content -Path $StateFile -Value $id
}

function Get-LatestSuccessfulRun {
    try {
        $json = gh run list --repo jackyzou/doge-consulting --branch master --workflow ci-deploy.yml --status success --limit 1 --json databaseId,headSha,conclusion,createdAt,displayTitle 2>&1
        if ($LASTEXITCODE -ne 0) { return $null }
        $runs = $json | ConvertFrom-Json
        if ($runs.Count -eq 0) { return $null }
        return $runs[0]
    } catch {
        Write-Log "ERROR: Failed to query GitHub: $_" "Red"
        return $null
    }
}

function Deploy {
    Write-Log "=== Starting deployment ===" "Cyan"

    Set-Location $ServicePath

    # 1. Pull
    Write-Log "Pulling latest code..." "Yellow"
    git fetch origin
    git reset --hard origin/master
    $commit = git log --oneline -1
    Write-Log "Commit: $commit" "Gray"

    # 2. Stop + rebuild
    Write-Log "Stopping old containers..." "Yellow"
    docker compose down --rmi all 2>$null
    docker system prune -f 2>$null

    Write-Log "Building Docker image (this may take 3-10 min)..." "Yellow"
    $buildResult = docker compose build --no-cache 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Log "ERROR: Docker build failed!" "Red"
        Write-Log ($buildResult | Select-Object -Last 20 | Out-String) "Red"
        return $false
    }

    # 3. Start
    Write-Log "Starting containers..." "Yellow"
    docker compose up -d --force-recreate

    # 4. Health check
    Write-Log "Waiting for health check..." "Gray"
    $healthy = $false
    for ($i = 1; $i -le 30; $i++) {
        Start-Sleep -Seconds 5
        try {
            $r = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 5
            if ($r.status -eq "ok") { $healthy = $true; break }
        } catch {
            Write-Log "  Health check attempt $i/30..." "Gray"
        }
    }

    if ($healthy) {
        Write-Log "=== Deploy successful! ===" "Green"
        Write-Log "  Local:  http://localhost:3000" "Green"
        Write-Log "  Live:   https://doge-consulting.com" "Green"
        Write-Log "  Commit: $commit" "Green"
        return $true
    } else {
        Write-Log "=== Health check failed after 150 seconds ===" "Red"
        docker compose logs --tail 50 app | ForEach-Object { Write-Log "  $_" "Red" }
        return $false
    }
}

# ── Main loop ──────────────────────────────────────────────────
Write-Log "========================================" "Magenta"
Write-Log "  Doge Consulting Auto-Deploy Listener" "Magenta"
Write-Log "  Watching: jackyzou/doge-consulting" "Magenta"
Write-Log "  Branch:   master" "Magenta"
Write-Log "  Poll:     every ${PollInterval}s" "Magenta"
Write-Log "  Path:     $ServicePath" "Magenta"
Write-Log "========================================" "Magenta"

# Verify gh CLI
try {
    $ghUser = gh auth status 2>&1
    Write-Log "GitHub CLI authenticated" "Green"
} catch {
    Write-Log "ERROR: gh CLI not authenticated. Run: gh auth login" "Red"
    exit 1
}

$lastId = Get-LastDeployedRunId
Write-Log "Last deployed run ID: $($lastId || 'none (first run)')"

while ($true) {
    $run = Get-LatestSuccessfulRun

    if ($run) {
        $runId = $run.databaseId.ToString()

        if ($runId -ne $lastId) {
            Write-Log "" "White"
            Write-Log "New successful CI run detected!" "Green"
            Write-Log "  Run ID:  $runId" "Cyan"
            Write-Log "  Commit:  $($run.headSha.Substring(0, 7))" "Cyan"
            Write-Log "  Title:   $($run.displayTitle)" "Cyan"
            Write-Log "  Time:    $($run.createdAt)" "Cyan"

            $success = Deploy

            if ($success) {
                Set-LastDeployedRunId $runId
                $lastId = $runId
                Write-Log "Deployment recorded. Resuming watch..." "Green"
            } else {
                Write-Log "Deployment failed. Will retry on next poll..." "Red"
            }
        }
    }

    Start-Sleep -Seconds $PollInterval
}
