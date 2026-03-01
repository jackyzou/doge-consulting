<#
.SYNOPSIS
    Back up the production SQLite database.
.DESCRIPTION
    Creates a timestamped copy of the production database file and
    cleans up backups older than 30 days. Can be scheduled with
    Windows Task Scheduler for automatic daily backups.
.PARAMETER DatabasePath
    Path to the SQLite database file. Reads from DATABASE_PATH env
    var if not specified.
.PARAMETER BackupDir
    Directory to store backups. Default: <ProjectDir>\data\backups
.PARAMETER RetainDays
    Number of days to keep backups. Default: 30
.EXAMPLE
    # Manual backup
    .\backup-db.ps1

    # Schedule daily at 2 AM using Task Scheduler
    schtasks /create /tn "DogeConsulting-Backup" /tr "powershell -File C:\doge-consulting\scripts\backup-db.ps1" /sc daily /st 02:00 /ru SYSTEM
#>
param(
    [string]$DatabasePath = "",
    [string]$BackupDir    = "",
    [int]$RetainDays      = 30
)

$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent $PSScriptRoot

# ── Resolve database path ──────────────────────────────────────
if (-not $DatabasePath) {
    # Try env var
    $DatabasePath = $env:DATABASE_PATH
}
if (-not $DatabasePath) {
    # Default locations
    $candidates = @(
        (Join-Path $ProjectDir "data\production.db"),
        (Join-Path $ProjectDir "prisma\dev.db")
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) {
            $DatabasePath = $c
            break
        }
    }
}
if (-not $DatabasePath -or -not (Test-Path $DatabasePath)) {
    Write-Host "ERROR: Database file not found." -ForegroundColor Red
    Write-Host "Specify path: .\backup-db.ps1 -DatabasePath C:\path\to\db.sqlite"
    exit 1
}

# ── Resolve backup directory ───────────────────────────────────
if (-not $BackupDir) {
    $BackupDir = Join-Path $ProjectDir "data\backups"
}
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

# ── Create backup ──────────────────────────────────────────────
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$dbName    = [System.IO.Path]::GetFileNameWithoutExtension($DatabasePath)
$backupFile = Join-Path $BackupDir "$dbName`_$timestamp.db"

Write-Host "Backing up database..." -ForegroundColor Cyan
Write-Host "  Source: $DatabasePath"
Write-Host "  Target: $backupFile"

# Use SQLite-safe backup: copy the file while it might be in use
# For WAL mode, we also copy -wal and -shm if they exist
Copy-Item $DatabasePath $backupFile -Force

$walFile = "$DatabasePath-wal"
$shmFile = "$DatabasePath-shm"
if (Test-Path $walFile) {
    Copy-Item $walFile "$backupFile-wal" -Force
}
if (Test-Path $shmFile) {
    Copy-Item $shmFile "$backupFile-shm" -Force
}

$size = (Get-Item $backupFile).Length / 1MB
Write-Host "  Backup complete! ($([math]::Round($size, 2)) MB)" -ForegroundColor Green

# ── Cleanup old backups ────────────────────────────────────────
$cutoff = (Get-Date).AddDays(-$RetainDays)
$removed = 0

Get-ChildItem $BackupDir -Filter "*.db" | Where-Object {
    $_.LastWriteTime -lt $cutoff
} | ForEach-Object {
    # Also remove associated WAL/SHM files
    Remove-Item $_.FullName -Force
    Remove-Item "$($_.FullName)-wal" -Force -ErrorAction SilentlyContinue
    Remove-Item "$($_.FullName)-shm" -Force -ErrorAction SilentlyContinue
    $removed++
}

if ($removed -gt 0) {
    Write-Host "  Cleaned up $removed old backup(s) (older than $RetainDays days)" -ForegroundColor Gray
}

# ── Summary ────────────────────────────────────────────────────
$totalBackups = (Get-ChildItem $BackupDir -Filter "*.db").Count
Write-Host "`nTotal backups: $totalBackups (keeping last $RetainDays days)" -ForegroundColor Cyan

Write-Host @"

To schedule daily backups at 2 AM, run (as Administrator):

  schtasks /create /tn "DogeConsulting-Backup" ``
    /tr "powershell -ExecutionPolicy Bypass -File $PSCommandPath" ``
    /sc daily /st 02:00 /ru SYSTEM /f

"@
