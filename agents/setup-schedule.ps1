<#
.SYNOPSIS
    Sets up Windows Task Scheduler jobs for the Doge Consulting Agent Fleet.
    Run this ONCE to install all scheduled tasks.

.DESCRIPTION
    Creates scheduled tasks:
    1. "Doge Fleet - Morning Brief" at 8:00 AM PST daily (full standup)
    2. "Doge Fleet - Evening Summary" at 5:00 PM PST daily (evening mode)
    3. "Doge Fleet - Hourly Ops" every hour (contact triage + quote lifecycle)
    4. "Doge Fleet - Health Check" every 6 hours (site health monitoring)
    5. "Doge Fleet - DB Sync" every 30 minutes (sync fleet logs to local DB)
    6. "Doge Fleet - Prod Sync" every 30 minutes (push data to production server)

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

# -- Task 1: Morning Brief (8:00 AM) --
Write-Host ""
Write-Host "Creating Morning Brief task at 8 AM daily..." -ForegroundColor Yellow

$morningAction = New-ScheduledTaskAction `
    -Execute $nodePath `
    -Argument "agents\run-fleet.mjs" `
    -WorkingDirectory $ProjectPath

$morningTrigger = New-ScheduledTaskTrigger -Daily -At "08:00AM"

$morningSettings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 10)

Register-ScheduledTask `
    -TaskName "Doge Fleet - Morning Brief" `
    -Action $morningAction `
    -Trigger $morningTrigger `
    -Settings $morningSettings `
    -Description "Doge Consulting Agent Fleet - Morning standup and daily brief email" `
    -Force | Out-Null

Write-Host "  OK: Morning Brief: 8:00 AM daily" -ForegroundColor Green

# -- Task 2: Evening Summary (5:00 PM) --
Write-Host "Creating Evening Summary task at 5 PM daily..." -ForegroundColor Yellow

$eveningAction = New-ScheduledTaskAction `
    -Execute $nodePath `
    -Argument "agents\run-fleet.mjs --mode evening" `
    -WorkingDirectory $ProjectPath

$eveningTrigger = New-ScheduledTaskTrigger -Daily -At "05:00PM"

$eveningSettings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 10)

Register-ScheduledTask `
    -TaskName "Doge Fleet - Evening Summary" `
    -Action $eveningAction `
    -Trigger $eveningTrigger `
    -Settings $eveningSettings `
    -Description "Doge Consulting Agent Fleet - End-of-day summary and decision log" `
    -Force | Out-Null

Write-Host "  OK: Evening Summary: 5:00 PM daily" -ForegroundColor Green

# -- Task 3: Hourly Operations (contact triage + quote lifecycle) --
Write-Host "Creating Hourly Ops task..." -ForegroundColor Yellow

$hourlyAction = New-ScheduledTaskAction `
    -Execute $nodePath `
    -Argument "-e `"Promise.all([import('./agents/lib/contact-triage.mjs').then(m=>m.triageNewContacts({verbose:false})).catch(()=>{}),import('./agents/lib/quote-lifecycle.mjs').then(m=>m.processQuoteLifecycle({verbose:false})).catch(()=>{})]).then(()=>process.exit(0))`"" `
    -WorkingDirectory $ProjectPath

$hourlyTrigger = New-ScheduledTaskTrigger -Once -At "00:00AM" `
    -RepetitionInterval (New-TimeSpan -Hours 1) `
    -RepetitionDuration (New-TimeSpan -Days 365)

$hourlySettings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 5)

Register-ScheduledTask `
    -TaskName "Doge Fleet - Hourly Ops" `
    -Action $hourlyAction `
    -Trigger $hourlyTrigger `
    -Settings $hourlySettings `
    -Description "Doge Consulting - Hourly contact triage and quote lifecycle checks" `
    -Force | Out-Null

Write-Host "  OK: Hourly Ops: every 1 hour" -ForegroundColor Green

# -- Task 4: Health Check (every 6 hours) --
Write-Host "Creating Health Check task..." -ForegroundColor Yellow

$healthAction = New-ScheduledTaskAction `
    -Execute $nodePath `
    -Argument "agents\lib\health-check.mjs" `
    -WorkingDirectory $ProjectPath

$healthTrigger = New-ScheduledTaskTrigger -Once -At "06:00AM" `
    -RepetitionInterval (New-TimeSpan -Hours 6) `
    -RepetitionDuration (New-TimeSpan -Days 365)

$healthSettings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 5)

Register-ScheduledTask `
    -TaskName "Doge Fleet - Health Check" `
    -Action $healthAction `
    -Trigger $healthTrigger `
    -Settings $healthSettings `
    -Description "Doge Consulting - Site health monitoring (build, uptime, pages)" `
    -Force | Out-Null

Write-Host "  OK: Health Check: every 6 hours" -ForegroundColor Green

# -- Task 5: DB Sync (every 30 minutes) --
Write-Host "Creating DB Sync task..." -ForegroundColor Yellow

$syncAction = New-ScheduledTaskAction `
    -Execute $nodePath `
    -Argument "scripts\sync-fleet-local.mjs" `
    -WorkingDirectory $ProjectPath

$syncTrigger = New-ScheduledTaskTrigger -Once -At "00:00AM" `
    -RepetitionInterval (New-TimeSpan -Minutes 30) `
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
    -Description "Doge Consulting - Sync standup logs and decisions to production DB" `
    -Force | Out-Null

Write-Host "  OK: DB Sync: every 30 minutes" -ForegroundColor Green

# -- Task 6: Production Sync (every 30 minutes) --
Write-Host "Creating Production Sync task..." -ForegroundColor Yellow

$prodSyncAction = New-ScheduledTaskAction `
    -Execute $nodePath `
    -Argument "agents\sync-fleet.mjs" `
    -WorkingDirectory $ProjectPath

$prodSyncTrigger = New-ScheduledTaskTrigger -Once -At "00:15AM" `
    -RepetitionInterval (New-TimeSpan -Minutes 30) `
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

Write-Host "  OK: Prod Sync: every 30 minutes" -ForegroundColor Green

# -- Verify --
Write-Host ""
Write-Host "Scheduled Tasks Created:" -ForegroundColor Cyan
Get-ScheduledTask -TaskName "Doge Fleet*" | Format-Table TaskName, State, @{N='NextRun';E={($_ | Get-ScheduledTaskInfo).NextRunTime}} -AutoSize

Write-Host ""
Write-Host "Setup complete! The agent fleet will run automatically." -ForegroundColor Green
Write-Host "   Morning brief:   8:00 AM daily  (full standup, all 7 phases)" -ForegroundColor Gray
Write-Host "   Evening summary: 5:00 PM daily  (evening mode)" -ForegroundColor Gray
Write-Host "   Hourly ops:      every 1 hour   (contact triage + quote lifecycle)" -ForegroundColor Gray
Write-Host "   Health check:    every 6 hours   (site monitoring)" -ForegroundColor Gray
Write-Host "   DB sync:         every 30 min    (fleet logs to local DB)" -ForegroundColor Gray
Write-Host "   Prod sync:       every 30 min    (push to production server)" -ForegroundColor Gray
Write-Host ""
Write-Host "To remove all: Get-ScheduledTask 'Doge Fleet*' | Unregister-ScheduledTask -Confirm" -ForegroundColor Gray
Write-Host "To test now: node agents\run-fleet.mjs" -ForegroundColor Gray
Write-Host ""
