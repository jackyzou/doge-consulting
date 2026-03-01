<#
.SYNOPSIS
    Prevent the computer from sleeping so the server stays online 24/7.
.DESCRIPTION
    Configures Windows power settings to:
    - Never enter sleep or hibernate (on AC power)
    - Never turn off the display (on AC power)
    - Do nothing when the lid is closed (on AC power)
.NOTES
    Must be run as Administrator.
    Only affects AC power (plugged in) settings.
    Battery settings are left unchanged for portability.
#>

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
Write-Host "  Power Settings — Always On"            -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# ── Apply power settings ───────────────────────────────────────
Write-Host "Configuring power settings (AC power)..." -ForegroundColor Cyan

# Never sleep when plugged in (0 = never)
powercfg /change standby-timeout-ac 0
Write-Host "  [OK] Sleep timeout: Never" -ForegroundColor Green

# Never hibernate when plugged in
powercfg /change hibernate-timeout-ac 0
Write-Host "  [OK] Hibernate timeout: Never" -ForegroundColor Green

# Never turn off display when plugged in
powercfg /change monitor-timeout-ac 0
Write-Host "  [OK] Display timeout: Never" -ForegroundColor Green

# Disable hard disk timeout
powercfg /change disk-timeout-ac 0
Write-Host "  [OK] Disk timeout: Never" -ForegroundColor Green

# ── Lid close action: Do Nothing (AC power) ────────────────────
# LIDACTION: 0 = Do nothing, 1 = Sleep, 2 = Hibernate, 3 = Shut down
# SUB_BUTTONS GUID: 4f971e89-eebd-4455-a8de-9e59040e7347
# LIDACTION GUID:   5ca83367-6e45-459f-a27b-476b1d01c936
try {
    powercfg /setacvalueindex SCHEME_CURRENT SUB_BUTTONS LIDACTION 0
    powercfg /setactive SCHEME_CURRENT
    Write-Host "  [OK] Lid close action: Do nothing" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Could not set lid close action (desktop PC?)" -ForegroundColor Yellow
}

# ── Disable Windows automatic sleep ────────────────────────────
# Disable "Allow wake timers" (prevents random wake/sleep cycles)
try {
    powercfg /setacvalueindex SCHEME_CURRENT SUB_SLEEP RTCWAKE 1
    powercfg /setactive SCHEME_CURRENT
    Write-Host "  [OK] Wake timers: Enabled (for scheduled tasks)" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Could not configure wake timers" -ForegroundColor Yellow
}

# ── Show current power plan ────────────────────────────────────
Write-Host "`nActive power plan:" -ForegroundColor Cyan
powercfg /getactivescheme

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Power configured — PC will stay on!"   -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host @"

IMPORTANT REMINDERS:
  - Keep the laptop PLUGGED IN at all times
  - These settings only apply when on AC power
  - If you close the lid, the server stays running
  - To revert: Control Panel → Power Options → Restore defaults

To verify settings:
  powercfg /query SCHEME_CURRENT

"@
