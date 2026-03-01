<#
.SYNOPSIS
    Set up a Cloudflare Tunnel to expose the local server to the internet.
.DESCRIPTION
    Installs cloudflared, guides you through creating a tunnel, and
    installs it as a Windows service so it auto-starts on boot.
.NOTES
    Must be run as Administrator for service installation.
    Requires a free Cloudflare account: https://dash.cloudflare.com/sign-up

    DOMAIN OPTIONS:
    ─────────────────────────────────────────────────────────────
    FREE (no domain needed):
      cloudflared tunnel --url http://localhost:3000
      → gives you a random *.trycloudflare.com URL (changes every restart)

    CHEAP (buy a domain, ~$2-10/year):
      Cloudflare Registrar: .xyz ~$2/yr, .site ~$2/yr, .com ~$10/yr
      Porkbun:              .xyz ~$2/yr, .life ~$2/yr
      Namecheap:            .xyz ~$1/yr (first year)
    ─────────────────────────────────────────────────────────────
#>
param(
    [int]$Port = 3000,
    [string]$TunnelName = "doge-consulting"
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  Cloudflare Tunnel Setup"               -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# ── Step 1: Install cloudflared ─────────────────────────────────
$cf = Get-Command cloudflared -ErrorAction SilentlyContinue

if ($cf) {
    Write-Host "[OK] cloudflared already installed at $($cf.Source)" -ForegroundColor Green
} else {
    Write-Host "Installing cloudflared..." -ForegroundColor Yellow

    # Try winget first
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget) {
        Write-Host "Installing via winget..."
        winget install Cloudflare.cloudflared --accept-package-agreements --accept-source-agreements
    } else {
        # Manual download
        Write-Host "Downloading cloudflared..."
        $cfUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
        $cfDest = "C:\tools\cloudflared.exe"
        New-Item -ItemType Directory -Path "C:\tools" -Force | Out-Null
        Invoke-WebRequest -Uri $cfUrl -OutFile $cfDest -UseBasicParsing

        # Add to PATH
        $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
        if ($machinePath -notlike "*C:\tools*") {
            [Environment]::SetEnvironmentVariable("Path", "$machinePath;C:\tools", "Machine")
            $env:Path += ";C:\tools"
        }
        Write-Host "Installed to $cfDest" -ForegroundColor Green
    }

    # Verify
    $cf = Get-Command cloudflared -ErrorAction SilentlyContinue
    if (-not $cf) {
        Write-Host "ERROR: cloudflared not found after installation. Restart your terminal and try again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# ── Step 2: Quick tunnel (no domain) ───────────────────────────
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OPTION A — Quick Tunnel (free, no domain)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host @"

  Just run this command to get a public URL instantly:

    cloudflared tunnel --url http://localhost:$Port

  You'll get a URL like: https://random-words.trycloudflare.com
  NOTE: The URL changes every time you restart the tunnel.

"@

# ── Step 3: Named tunnel (requires domain) ─────────────────────
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OPTION B — Named Tunnel (custom domain)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host @"

  For a permanent custom domain, follow these steps:

  1. Buy a domain (cheapest options):
     - Cloudflare Registrar: .xyz ~`$2/yr, .site ~`$2/yr
     - Porkbun: .xyz ~`$2/yr
     - Or transfer an existing domain to Cloudflare

  2. Add the domain to Cloudflare (free plan):
     https://dash.cloudflare.com → Add a site → follow DNS setup

  3. Log in to Cloudflare from this machine:

       cloudflared tunnel login

     This opens a browser to authorize your Cloudflare account.

  4. Create a named tunnel:

       cloudflared tunnel create $TunnelName

     Note the Tunnel ID (a UUID) that's printed.

  5. Configure the tunnel — create a config file:

       `$configDir = "`$env:USERPROFILE\.cloudflared"
       New-Item -ItemType Directory -Path `$configDir -Force

     Create `$configDir\config.yml with:

       tunnel: <TUNNEL_ID>
       credentials-file: `$configDir\<TUNNEL_ID>.json
       ingress:
         - hostname: yourdomain.com
           service: http://localhost:$Port
         - service: http_status:404

  6. Create a DNS route:

       cloudflared tunnel route dns $TunnelName yourdomain.com

  7. Test the tunnel:

       cloudflared tunnel run $TunnelName

  8. Install as Windows service (auto-start on boot):

       cloudflared service install

     This creates a Windows service that starts the tunnel automatically.

  9. Verify:

       Get-Service cloudflared
       # Should show "Running"

"@

# ── Offer to run quick tunnel now ───────────────────────────────
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
$response = Read-Host "Start a quick tunnel now? (y/n)"

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "`nStarting quick tunnel to http://localhost:$Port ..." -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop.`n" -ForegroundColor Gray
    cloudflared tunnel --url http://localhost:$Port
} else {
    Write-Host "`nDone! Follow the instructions above to set up your tunnel." -ForegroundColor Green
}
