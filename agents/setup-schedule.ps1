<#
.SYNOPSIS
    Sets up Windows Task Scheduler jobs for the Doge Consulting Agent Fleet.
    Run this ONCE to install all scheduled tasks.

.DESCRIPTION
    Creates scheduled tasks:
    1. "Doge Fleet - Morning Standup" at 8:00 AM PST daily (full standup with health check)
    2. "Doge Fleet - DB Sync" every 1 hour (sync fleet logs to local DB)
    3. "Doge Fleet - Prod Sync" every 1 hour (push data to production server)

    Suspended (not installed):
    - Hourly Ops (contact triage + quote lifecycle) — suspended per CEO
    - Evening Summary — standup is now once daily + ad-hoc
    - Standalone Health Check — now part of morning standup

.EXAMPLE
    .\agents\setup-schedule.ps1
    .\agents\setup-schedule.ps1 -ProjectPath "D:\doge-consulting"
#>
param(
    [string]$ProjectPath = $(
        @("C:\Users\jiaqizou\doge-consulting", "C:\doge-consulting", (Join-Path $PSScriptRoot "..")) |
        Where-Object { Test-Path (Join-Path $_ "agents\run-fleet.mjs") } |
        Select-Object -First 1
    )
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Doge Consulting - Agent Fleet Scheduler Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Project path: $ProjectPath" -ForegroundColor Gray

# Verify node and project exist
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host "ERROR: Node.js not found. Install Node.js first." -ForegroundColor Red
    exit 1
}
$nodePath = $nodeCmd.Source
Write-Host "Node.js: $nodePath" -ForegroundColor Gray

if (-not (Test-Path (Join-Path $ProjectPath "agents\run-fleet.mjs"))) {
    Write-Host "ERROR: agents/run-fleet.mjs not found at $ProjectPath" -ForegroundColor Red
    exit 1
}

# -- Task 1: Morning Standup (8:00 AM) --
Write-Host ""
Write-Host "Creating Morning Standup task at 8 AM daily..." -ForegroundColor Yellow

$morningAction = New-ScheduledTaskAction `
    -Execute $nodePath `
    -Argument "agents\run-fleet.mjs" `
    -WorkingDirectory $ProjectPath

$morningTrigger = New-ScheduledTaskTrigger -Daily -At "08:00AM"

$morningSettings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 15)

Register-ScheduledTask `
    -TaskName "Doge Fleet - Morning Standup" `
    -Action $morningAction `
    -Trigger $morningTrigger `
    -Settings $morningSettings `
    -Description "Doge Consulting Agent Fleet - Daily standup with health check (all 7 phases)" `
    -Force | Out-Null

Write-Host "  OK: Morning Standup: 8:00 AM daily" -ForegroundColor Green

# -- Task 2: DB Sync (every 1 hour) --
Write-Host "Creating DB Sync task..." -ForegroundColor Yellow

$syncAction = New-ScheduledTaskAction `
    -Execute $nodePath `
    -Argument "scripts\sync-fleet-local.mjs" `
    -WorkingDirectory $ProjectPath

$syncTrigger = New-ScheduledTaskTrigger -Once -At "00:00AM" `
    -RepetitionInterval (New-TimeSpan -Hours 1) `
    -RepetitionDuration (New-TimeSpan -Days 365)

$syncSettings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 3)

Register-ScheduledTask `
    -TaskName "Doge Fleet - DB Sync" `
    -Action $syncAction `
    -Trigger $syncTrigger `
    -Settings $syncSettings `
    -Description "Doge Consulting - Sync standup logs and decisions to local production DB" `
    -Force | Out-Null

Write-Host "  OK: DB Sync: every 1 hour" -ForegroundColor Green

# -- Task 3: Production Sync (every 1 hour) --
Write-Host "Creating Production Sync task..." -ForegroundColor Yellow

$prodSyncAction = New-ScheduledTaskAction `
    -Execute $nodePath `
    -Argument "agents\sync-fleet.mjs" `
    -WorkingDirectory $ProjectPath

$prodSyncTrigger = New-ScheduledTaskTrigger -Once -At "00:30AM" `
    -RepetitionInterval (New-TimeSpan -Hours 1) `
    -RepetitionDuration (New-TimeSpan -Days 365)

$prodSyncSettings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 3)

Register-ScheduledTask `
    -TaskName "Doge Fleet - Prod Sync" `
    -Action $prodSyncAction `
    -Trigger $prodSyncTrigger `
    -Settings $prodSyncSettings `
    -Description "Doge Consulting - Push standups, chat threads, and decisions to production server" `
    -Force | Out-Null

Write-Host "  OK: Prod Sync: every 1 hour" -ForegroundColor Green

# -- Remove old tasks if they exist --
Write-Host ""
Write-Host "Cleaning up old tasks..." -ForegroundColor Yellow
@("Doge Fleet - Evening Summary", "Doge Fleet - Hourly Ops", "Doge Fleet - Health Check", "Doge Fleet - Morning Brief") | ForEach-Object {
    try { Unregister-ScheduledTask -TaskName $_ -Confirm:$false -ErrorAction SilentlyContinue; Write-Host "  Removed: $_" -ForegroundColor Gray } catch {}
}
    -ExecutionTimeLimit (New-TimeSpan -Minutes 3)

Register-ScheduledTask `
    -TaskName "Doge Fleet - Prod Sync" `
    -Action $prodSyncAction `
    -Trigger $prodSyncTrigger `
    -Settings $prodSyncSettings `
    -Description "Doge Consulting - Push standups, chat threads, and decisions to production server" `
    -Force | Out-Null

Write-Host "  OK: Prod Sync: every 1 hour" -ForegroundColor Green

# -- Verify --
Write-Host ""
Write-Host "Scheduled Tasks Created:" -ForegroundColor Cyan
Get-ScheduledTask -TaskName "Doge Fleet*" | Format-Table TaskName, State, @{N='NextRun';E={($_ | Get-ScheduledTaskInfo).NextRunTime}} -AutoSize

Write-Host ""
Write-Host "Setup complete! The agent fleet will run automatically." -ForegroundColor Green
Write-Host "   Morning standup: 8:00 AM daily  (full standup + health check)" -ForegroundColor Gray
Write-Host "   DB sync:         every 1 hour   (fleet logs to local DB)" -ForegroundColor Gray
Write-Host "   Prod sync:       every 1 hour   (push to production server)" -ForegroundColor Gray
Write-Host ""
Write-Host "   Suspended: Hourly Ops, Evening Summary, Standalone Health Check" -ForegroundColor DarkGray
Write-Host ""
Write-Host "To remove all: Get-ScheduledTask 'Doge Fleet*' | Unregister-ScheduledTask -Confirm" -ForegroundColor Gray
Write-Host "To test now: node agents\run-fleet.mjs" -ForegroundColor Gray
Write-Host ""
