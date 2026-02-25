# ===================================================================
#  ports.ps1 - Geliştirme Sunucuları Yönetim Betiği
# ===================================================================
#  Bu betik, API (Port 3000) ve Frontend (Port 3001) sunucularını
#  "development" modunda (hot-reloading aktif) yönetir.
#
#  Kullanım:
#    .\scripts\ports.ps1 start   # Her iki sunucuyu geliştirme modunda başlat
#    .\scripts\ports.ps1 stop    # Her iki sunucuyu durdur
#    .\scripts\ports.ps1 status  # Port durumlarını göster
#    .\scripts\ports.ps1 restart # Sunucuları durdur ve yeniden başlat
# ===================================================================

param(
    [Parameter(Position=0)]
    [ValidateSet("start","stop","status","restart")]
    [string]$Action = "status"
)

# ... (Show-Status ve Stop-Servers fonksiyonları aynı kalır) ...
function Show-Status {
    Write-Host "`n--- Port Durumu ---" -ForegroundColor Cyan
    $ports = Get-NetTCPConnection -LocalPort 3000,3001 -ErrorAction SilentlyContinue
    if ($ports) {
        $ports | Format-Table -AutoSize

        $listen3000 = $ports | Where-Object { $_.LocalPort -eq 3000 -and $_.State -eq 'Listen' }
        $listen3001 = $ports | Where-Object { $_.LocalPort -eq 3001 -and $_.State -eq 'Listen' }
        if (-not $listen3000) { Write-Host "  Port 3000: KAPALI (Listen yok)" -ForegroundColor Yellow }
        if (-not $listen3001) { Write-Host "  Port 3001: KAPALI (Listen yok)" -ForegroundColor Yellow }
    } else {
        Write-Host "  Port 3000: KAPALI" -ForegroundColor Yellow
        Write-Host "  Port 3001: KAPALI" -ForegroundColor Yellow
    }
}

function Stop-Servers {
    Write-Host "`n--- Sunucular durduruluyor ---" -ForegroundColor Red
    # 'npx' ve 'node' ile başlatılan tüm alt işlemleri bul ve durdur
    $nodeProcesses = Get-CimInstance Win32_Process | Where-Object { $_.ParentProcessId -in @($pid) -and ($_.Name -eq "node.exe" -or $_.Name -eq "powershell.exe") }
    if ($nodeProcesses) {
        $nodeProcesses | ForEach-Object {
            Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
            Write-Host "  Durdurulan Geliştirme Süreci: PID $($_.ProcessId)" -ForegroundColor Yellow
        }
    }
    # Ek olarak portları kontrol et
    @(3000, 3001) | ForEach-Object {
        $port = $_
        $pids = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty OwningProcess -Unique
        if ($pids) {
            $pids | ForEach-Object {
                Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
                Write-Host "  Port $port - PID $_ durduruldu" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  Port $port zaten kapali" -ForegroundColor DarkGray
        }
    }
    Start-Sleep -Seconds 1
    Write-Host "  Durdurma işlemi tamamlandı." -ForegroundColor Green
}


function Start-Servers {
    Write-Host "`n--- Sunucular geliştirme modunda baslatiliyor (Hot-Reload Aktif) ---" -ForegroundColor Green

    # 0) TypeScript build (API dev-server'in ihtiyaç duyduğu dist/* çıktıları icin)
    Write-Host "  [0/2] TypeScript build calistiriliyor (tsc)..." -ForegroundColor Cyan
    try {
        npx tsc -p tsconfig.build.json
        Write-Host "        TypeScript build tamamlandi." -ForegroundColor Green
    } catch {
        Write-Host "        HATA: TypeScript build basarisiz oldu, dev-server baslatilamadi." -ForegroundColor Red
        return
    }

    # 1) API sunucusu (port 3000) - nodemon ile
    Write-Host "  [1/2] API sunucusu baslatiliyor (nodemon ile port 3000)..." -ForegroundColor Cyan
    $already3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
    if ($already3000) {
        Write-Host "        Port 3000 zaten kullaniliyor, atlanıyor." -ForegroundColor Yellow
    } else {
        # Ayrı bir pencerede başlat
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx nodemon --watch src --watch scripts scripts/dev-server.js"
        Start-Sleep -Seconds 3 # Nodemon'un başlaması için bekle
        $check3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
        if ($check3000) {
            Write-Host "        Port 3000 AKTIF (Hot-Reload)" -ForegroundColor Green
        } else {
            Write-Host "        UYARI: Port 3000 baslatılamadı! Ayrı pencereyi kontrol edin." -ForegroundColor Red
        }
    }

    # 2) Next.js frontend (port 3001) - next dev ile
    Write-Host "  [2/2] Frontend sunucusu baslatiliyor (next dev ile port 3001)..." -ForegroundColor Cyan
    $already3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
    if ($already3001) {
        Write-Host "        Port 3001 zaten kullaniliyor, atlaniyor." -ForegroundColor Yellow
    } else {
        # Ayrı bir pencerede başlat
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx next dev --port 3001"
        Start-Sleep -Seconds 5 # Next.js dev sunucusunun başlaması için bekle
        $check3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
        if ($check3001) {
            Write-Host "        Port 3001 AKTIF (Hot-Reload)" -ForegroundColor Green
        } else {
            Write-Host "        UYARI: Port 3001 baslatılamadı! Ayrı pencereyi kontrol edin." -ForegroundColor Red
        }
    }

    Write-Host "`n  Başlatma işlemi tamamlandı!" -ForegroundColor Green
}

# --- Ana Akış ---
switch ($Action) {
    "start"   { Start-Servers; Show-Status }
    "stop"    { Stop-Servers;  Show-Status }
    "restart" { Stop-Servers;  Start-Servers; Show-Status }
    "status"  { Show-Status }
}
