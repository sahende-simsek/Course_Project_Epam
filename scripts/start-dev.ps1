param(
  [switch]$RunE2E
)

# start-dev.ps1
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-dev.ps1 [-RunE2E]

Set-StrictMode -Version Latest

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
Write-Output "Repo root: $repoRoot"

Write-Output 'Stopping any node processes (best-effort)'
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

Write-Output 'Cleaning old logs'
Remove-Item "$repoRoot\next_out.log" -ErrorAction SilentlyContinue
Remove-Item "$repoRoot\next_err.log" -ErrorAction SilentlyContinue
Remove-Item "$repoRoot\dev_server_out.log" -ErrorAction SilentlyContinue
Remove-Item "$repoRoot\dev_server_err.log" -ErrorAction SilentlyContinue

function Start-BackgroundCmd($cmd, $cwd) {
  Write-Output "Starting: $cmd"
  Start-Process -FilePath cmd.exe -ArgumentList '/c', $cmd -WorkingDirectory $cwd -WindowStyle Hidden | Out-Null
}

Push-Location $repoRoot
try {
  # Start Next.js (frontend) on 3001
  Start-BackgroundCmd "npx next start --port 3001 > next_out.log 2> next_err.log" $repoRoot

  # Start dev API server
  Start-BackgroundCmd "node scripts/dev-server.js > dev_server_out.log 2> dev_server_err.log" $repoRoot

  # Wait for services
  function Wait-ForUrl($url, $timeoutSec) {
    $end = (Get-Date).AddSeconds($timeoutSec)
    while ((Get-Date) -lt $end) {
      try {
        $r = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 3 -ErrorAction Stop
        if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 400) { return $true }
      } catch { }
      Start-Sleep -Seconds 1
    }
    return $false
  }

  Write-Output 'Waiting for API at http://localhost:3000/_health ...'
  $apiReady = Wait-ForUrl 'http://localhost:3000/_health' 20
  Write-Output "API ready: $apiReady"

  Write-Output 'Waiting for Frontend at http://localhost:3001/ ...'
  $feReady = Wait-ForUrl 'http://localhost:3001/' 20
  Write-Output "Frontend ready: $feReady"

  Write-Output 'Ports status:'
  Get-NetTCPConnection -LocalPort 3000,3001 -ErrorAction SilentlyContinue | Select State,OwningProcess,LocalAddress,LocalPort | Format-Table -AutoSize

  Write-Output 'Tail of logs (frontend then api)'
  if (Test-Path "$repoRoot\next_out.log") { Write-Output '---next_out.log---'; Get-Content "$repoRoot\next_out.log" -Tail 50 }
  if (Test-Path "$repoRoot\next_err.log") { Write-Output '---next_err.log---'; Get-Content "$repoRoot\next_err.log" -Tail 50 }
  if (Test-Path "$repoRoot\dev_server_out.log") { Write-Output '---dev_server_out.log---'; Get-Content "$repoRoot\dev_server_out.log" -Tail 50 }
  if (Test-Path "$repoRoot\dev_server_err.log") { Write-Output '---dev_server_err.log---'; Get-Content "$repoRoot\dev_server_err.log" -Tail 50 }

  if ($RunE2E) {
    Write-Output 'Running Playwright E2E test for frontend...'
    # Use cmd.exe to set env for child process to mimic CI/test runs on Windows
    cmd.exe /c "set PLAYWRIGHT_BASE_URL=http://localhost:3001&&npx playwright test tests/e2e/frontend --reporter=list"
  }

} finally {
  Pop-Location
}
