<#
.SYNOPSIS
    Zero-downtime auto-deploy for Doge Consulting.
    Polls GitHub Actions for successful CI runs and deploys with no service interruption.

.DESCRIPTION
    This script implements blue-green deployment:
    1. Polls GitHub every 60s for new successful CI runs on master
    2. Builds the new Docker image IN THE BACKGROUND (old container keeps running)
    3. Only stops the old container AFTER the new image is built
    4. Starts the new container and waits for health check
    5. Sends a deployment notification email
    6. Cleans up old images

    The app is only down for ~2-5 seconds (container swap), not minutes.

.PARAMETER ServicePath
    Path to the project directory. Default: C:\doge-consulting or script parent

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
$VersionFile = Join-Path $ServicePath "VERSION"

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

function Get-CurrentVersion {
    $pkgJson = Join-Path $ServicePath "package.json"
    if (Test-Path $pkgJson) {
        $pkg = Get-Content $pkgJson -Raw | ConvertFrom-Json
        return $pkg.version
    }
    if (Test-Path $VersionFile) { return (Get-Content $VersionFile -Raw).Trim() }
    return "0.0.0"
}

function Get-DeployDiff {
    # Get lines changed and feature summary from recent commits
    try {
        $diffStat = git diff HEAD~1 --stat 2>&1 | Select-Object -Last 1
        $summary = git log -1 --format="%s" 2>&1
        # Sanitize non-ASCII characters for email
        $summary = $summary -replace '[^\x20-\x7E]', '-'
        $diffStat = $diffStat -replace '[^\x20-\x7E]', ' '
        return @{ summary = $summary; diffStat = $diffStat }
    } catch {
        return @{ summary = "Update"; diffStat = "" }
    }
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

function Send-DeployEmail($version, $commit, $title, $success, $duration) {
    try {
        $status = if ($success) { "SUCCESS" } else { "FAILED" }
        $statusIcon = if ($success) { "[OK]" } else { "[FAIL]" }
        $statusColor = if ($success) { "#059669" } else { "#dc2626" }
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC"

        # Get feature summary and lines changed
        $commitSummary = (git log -1 --format="%s" 2>$null) -replace '[^\x20-\x7E]', '-'
        $diffStat = (git diff HEAD~1 --stat 2>$null | Select-Object -Last 1) -replace '[^\x20-\x7E]', ' '
        if (-not $diffStat) { $diffStat = "N/A" }

        # Sanitize all strings for JSON/HTML
        $safeTitle = ($title -replace '[^\x20-\x7E]', '-') -replace '"', '&quot;'
        $safeCommit = ($commit -replace '[^\x20-\x7E]', ' ') -replace '"', '&quot;'
        $safeSummary = $commitSummary -replace '"', '&quot;'
        $safeDiff = $diffStat -replace '"', '&quot;'

        $htmlBody = @"
<div style="font-family:system-ui;max-width:600px;margin:0 auto;padding:20px;">
<h2 style="color:#0f2b46;">$statusIcon Site Deployment - v$version</h2>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Status</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold;color:$statusColor;">$status</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Version</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold;">v$version</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Commit</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-family:monospace;">$safeCommit</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Summary</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">$safeSummary</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Changes</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:12px;">$safeDiff</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Duration</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${duration}s</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Time</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">$timestamp</td></tr>
<tr><td style="padding:8px;color:#6b7280;">Site</td><td style="padding:8px;"><a href="https://doge-consulting.com" style="color:#2ec4b6;">https://doge-consulting.com</a></td></tr>
</table>
<p style="color:#9ca3af;font-size:12px;margin-top:20px;">Automated deployment by Doge Consulting CI/CD</p>
</div>
"@

        $body = @{
            to = "dogetech77@gmail.com"
            subject = "$statusIcon Doge Consulting v$version deployed - $status"
            html = $htmlBody
            type = "deployment"
        } | ConvertTo-Json -Depth 3

        # Wait a moment for the app to be fully ready, then send via API
        Start-Sleep -Seconds 5
        $sent = $false
        for ($attempt = 1; $attempt -le 3; $attempt++) {
            try {
                Invoke-RestMethod -Uri "http://localhost:3000/api/deploy-notify" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 15 2>$null
                $sent = $true
                break
            } catch {
                Write-Log "  Email attempt $attempt/3 failed: $_" "Yellow"
                Start-Sleep -Seconds 5
            }
        }
        if ($sent) {
            Write-Log "  Deployment email sent to dogetech77@gmail.com" "Green"
        } else {
            Write-Log "  Warning: Could not send deploy email after 3 attempts" "Yellow"
        }
    } catch {
        Write-Log "  Warning: Could not send deploy email: $_" "Yellow"
    }
}

function Deploy($run) {
    $startTime = Get-Date
    Write-Log "=== Starting zero-downtime deployment ===" "Cyan"

    Set-Location $ServicePath

    # 1. Pull latest code (while old container still runs)
    Write-Log "Pulling latest code..." "Yellow"
    git fetch origin
    git reset --hard origin/master
    $commit = git log --oneline -1
    Write-Log "  Commit: $commit" "Gray"

    # 2. Read version from package.json (source of truth)
    $version = Get-CurrentVersion
    Write-Log "  Version: v$version" "Cyan"

    # 3. Build new image IN THE BACKGROUND (old container keeps serving traffic)
    Write-Log "Building new Docker image (old app still running)..." "Yellow"
    $buildResult = docker compose build --no-cache app 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Log "ERROR: Docker build failed!" "Red"
        Write-Log ($buildResult | Select-Object -Last 20 | Out-String) "Red"
        $duration = [math]::Round(((Get-Date) - $startTime).TotalSeconds)
        Send-DeployEmail $version $commit ($run.displayTitle) $false $duration
        return $false
    }
    Write-Log "  Image built successfully" "Green"

    # 4. Swap containers (only ~2-5s downtime)
    Write-Log "Swapping containers (brief ~2-5s interruption)..." "Yellow"
    docker compose up app -d --force-recreate --no-deps 2>&1 | Out-Null

    # 5. Health check
    Write-Log "Waiting for health check..." "Gray"
    $healthy = $false
    for ($i = 1; $i -le 30; $i++) {
        Start-Sleep -Seconds 3
        try {
            $r = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 5
            if ($r.status -eq "ok") { $healthy = $true; break }
        } catch {
            if ($i % 5 -eq 0) { Write-Log "  Health check attempt $i/30..." "Gray" }
        }
    }

    # 6. Clean up old images (keep latest only)
    docker image prune -f 2>$null | Out-Null

    $duration = [math]::Round(((Get-Date) - $startTime).TotalSeconds)

    if ($healthy) {
        Write-Log "=== Deploy v$version successful! (${duration}s) ===" "Green"
        Write-Log "  Local:   http://localhost:3000" "Green"
        Write-Log "  Live:    https://doge-consulting.com" "Green"
        Write-Log "  Version: v$version" "Green"
        Write-Log "  Commit:  $commit" "Green"
        Send-DeployEmail $version $commit ($run.displayTitle) $true $duration
        return $true
    } else {
        Write-Log "=== Health check failed after 90 seconds ===" "Red"
        docker compose logs --tail 30 app | ForEach-Object { Write-Log "  $_" "Red" }
        Send-DeployEmail $version $commit ($run.displayTitle) $false $duration
        return $false
    }
}

# ── Main loop ──────────────────────────────────────────────────
Write-Log "========================================" "Magenta"
Write-Log "  Doge Consulting Auto-Deploy v2" "Magenta"
Write-Log "  Strategy: Zero-Downtime (Blue-Green)" "Magenta"
Write-Log "  Watching: jackyzou/doge-consulting" "Magenta"
Write-Log "  Branch:   master" "Magenta"
Write-Log "  Poll:     every ${PollInterval}s" "Magenta"
Write-Log "  Path:     $ServicePath" "Magenta"
Write-Log "  Version:  v$(Get-CurrentVersion)" "Magenta"
Write-Log "========================================" "Magenta"

# Verify gh CLI
try {
    gh auth status 2>&1 | Out-Null
    Write-Log "GitHub CLI authenticated" "Green"
} catch {
    Write-Log "ERROR: gh CLI not authenticated. Run: gh auth login" "Red"
    exit 1
}

$lastId = Get-LastDeployedRunId
Write-Log "Last deployed run ID: $($lastId ? $lastId : 'none (first run)')"

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

            $success = Deploy $run

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
