<#
.SYNOPSIS
    Sets up Windows Task Scheduler jobs for the Doge Consulting Agent Fleet.
    Run this ONCE to install the two daily scheduled tasks.

.DESCRIPTION
    Creates two scheduled tasks:
    1. "Doge Fleet - Morning Brief" at 8:00 AM PST daily
    2. "Doge Fleet - Evening Summary" at 5:00 PM PST daily

.EXAMPLE
    .\agents\setup-schedule.ps1
    .\agents\setup-schedule.ps1 -ProjectPath "D:\doge-consulting"
#>
param(
    [string]$ProjectPath = $(if (Test-Path "C:\doge-consulting") { "C:\doge-consulting" } else { $PSScriptRoot + "\.." })
)

$ErrorActionPreference = "Stop"

Write-Host "`n🐕 Doge Consulting — Agent Fleet Scheduler Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Project path: $ProjectPath" -ForegroundColor Gray

# Verify node and project exist
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found. Install Node.js first." -ForegroundColor Red
    exit 1
}
if (-not (Test-Path (Join-Path $ProjectPath "agents\run-fleet.mjs"))) {
    Write-Host "❌ agents/run-fleet.mjs not found at $ProjectPath" -ForegroundColor Red
    exit 1
}

$nodePath = (Get-Command node).Source

# ── Task 1: Morning Brief (8:00 AM) ──
Write-Host "`n📅 Creating Morning Brief task (8:00 AM daily)..." -ForegroundColor Yellow

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
    -Description "Doge Consulting Agent Fleet — Morning standup and daily brief email to dogetech77@gmail.com" `
    -Force | Out-Null

Write-Host "  ✅ Morning Brief: 8:00 AM daily" -ForegroundColor Green

# ── Task 2: Evening Summary (5:00 PM) ──
Write-Host "📅 Creating Evening Summary task (5:00 PM daily)..." -ForegroundColor Yellow

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
    -Description "Doge Consulting Agent Fleet — End-of-day summary and decision log" `
    -Force | Out-Null

Write-Host "  ✅ Evening Summary: 5:00 PM daily" -ForegroundColor Green

# ── Verify ──
Write-Host "`n📋 Scheduled Tasks Created:" -ForegroundColor Cyan
Get-ScheduledTask -TaskName "Doge Fleet*" | Format-Table TaskName, State, @{N='NextRun';E={($_ | Get-ScheduledTaskInfo).NextRunTime}} -AutoSize

Write-Host "`n✅ Setup complete! The agent fleet will run automatically." -ForegroundColor Green
Write-Host "   Morning brief:   8:00 AM daily → email to dogetech77@gmail.com" -ForegroundColor Gray
Write-Host "   Evening summary: 5:00 PM daily → decision log" -ForegroundColor Gray
Write-Host "`n💡 To remove: Unregister-ScheduledTask -TaskName 'Doge Fleet*' -Confirm" -ForegroundColor Gray
Write-Host "💡 To test now: node agents\run-fleet.mjs`n" -ForegroundColor Gray
