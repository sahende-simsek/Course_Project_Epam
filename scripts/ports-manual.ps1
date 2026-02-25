param(
    [Parameter(Position=0)]
    [ValidateSet("start","stop","status","restart")]
    [string]$Action = "status"
)

# Simple manual dev server manager (no nodemon).
# - Starts API: `node dist/scripts/dev-server.js` (runs `npx tsc` first if needed)
# - Starts Next dev: `npx next dev --port 3001`
# - Stores PIDs in scripts/tmp/*.pid so Stop can kill them.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$tmpDir = Join-Path $scriptDir 'tmp'
if (-not (Test-Path $tmpDir)) { New-Item -ItemType Directory -Path $tmpDir | Out-Null }

$apiPidFile = Join-Path $tmpDir 'dev_server.pid'
$nextPidFile = Join-Path $tmpDir 'next.pid'

function Show-Status {
    Write-Host "--- Ports (LISTEN) ---" -ForegroundColor Cyan
    try {
        $ports = Get-NetTCPConnection -LocalPort 3000,3001 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
        if ($ports) { $ports | Select-Object LocalAddress,LocalPort,State,OwningProcess | Format-Table -AutoSize }
        else { Write-Host "  no listeners on 3000/3001" -ForegroundColor Yellow }
    } catch { Write-Host "  Unable to query ports: $_" -ForegroundColor Red }

    if (Test-Path $apiPidFile) { Write-Host "API PID:" (Get-Content $apiPidFile).Trim() }
    if (Test-Path $nextPidFile) { Write-Host "Next PID:" (Get-Content $nextPidFile).Trim() }
}

function Stop-Manual {
    Write-Host "Stopping manual dev servers..." -ForegroundColor Cyan
    if (Test-Path $apiPidFile) {
        try { Stop-Process -Id (Get-Content $apiPidFile) -Force -ErrorAction Stop; Remove-Item $apiPidFile -ErrorAction SilentlyContinue; Write-Host "  Stopped API" -ForegroundColor Green } catch { Write-Host "  Failed to stop API: $_" -ForegroundColor Yellow }
    } else { Write-Host "  API not running (no pid file)" -ForegroundColor DarkGray }

    if (Test-Path $nextPidFile) {
        try { Stop-Process -Id (Get-Content $nextPidFile) -Force -ErrorAction Stop; Remove-Item $nextPidFile -ErrorAction SilentlyContinue; Write-Host "  Stopped Next" -ForegroundColor Green } catch { Write-Host "  Failed to stop Next: $_" -ForegroundColor Yellow }
    } else { Write-Host "  Next not running (no pid file)" -ForegroundColor DarkGray }
    Start-Sleep -Seconds 1
    Show-Status
}

function Start-Manual {
    Write-Host "Starting manual dev servers..." -ForegroundColor Cyan

    # Build TS for API if dist missing or out of date
    $distApi = Join-Path $scriptDir '..\dist\scripts\dev-server.js' | Resolve-Path -ErrorAction SilentlyContinue
    if (-not $distApi) {
        Write-Host "  Building TypeScript (npx tsc -p tsconfig.build.json) ..." -ForegroundColor Cyan
        & npx tsc -p tsconfig.build.json
        if ($LASTEXITCODE -ne 0) { Write-Host "  TypeScript build failed." -ForegroundColor Red; return }
    }

    # Start API
    if (-not (Test-Path $apiPidFile)) {
        Write-Host "  Launching API: node dist/scripts/dev-server.js" -ForegroundColor Cyan
        $proc = Start-Process -FilePath node -ArgumentList 'dist/scripts/dev-server.js' -PassThru
        Start-Sleep -Milliseconds 300
        $proc.Id | Out-File -FilePath $apiPidFile -Encoding ascii
        Write-Host "    API PID: $($proc.Id)" -ForegroundColor Green
    } else { Write-Host "  API already started (pid file exists)" -ForegroundColor Yellow }

    # Start Next dev
    if (-not (Test-Path $nextPidFile)) {
        Write-Host "  Launching Next dev: npx next dev --port 3001" -ForegroundColor Cyan
        $proc2 = Start-Process -FilePath npx -ArgumentList 'next','dev','--port','3001' -PassThru
        Start-Sleep -Milliseconds 500
        $proc2.Id | Out-File -FilePath $nextPidFile -Encoding ascii
        Write-Host "    Next PID: $($proc2.Id)" -ForegroundColor Green
    } else { Write-Host "  Next already started (pid file exists)" -ForegroundColor Yellow }

    Start-Sleep -Seconds 1
    Show-Status
}

switch ($Action) {
    'start' { Start-Manual }
    'stop'  { Stop-Manual }
    'restart' { Stop-Manual; Start-Manual }
    default { Show-Status }
}
