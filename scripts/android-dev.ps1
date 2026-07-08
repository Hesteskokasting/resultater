# scripts/android-dev.ps1
#
# Ein kommando som set opp heile lokal Android-testing mot Vite dev-server:
#   1. Startar Vite (bunde til 127.0.0.1)
#   2. Set opp adb reverse tcp:5173 tcp:5173
#   3. Synkroniserer Capacitor mot lokal server
#   4. Opnar Android Studio
#
# Etter dette trengs INGEN ny sync/build for vanlege kodeendringar - Vite HMR
# pushar endringane direkte til WebView-en, akkurat som i vanleg nettlesar.
#
# Scriptet held seg køyrande og set opp adb reverse på nytt automatisk viss
# eininga koplar av/på USB. Trykk Ctrl+C for å avslutte (stoppar Vite).

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

Write-Host "Startar Vite dev-server (127.0.0.1:5173)..."

# Køyrer node.exe direkte mot vite sin lokale bin-fil (ikkje "npm run dev" eller
# "npx vite") - både npm og npx er .cmd/.ps1-filer på Windows, ikkje ekte .exe.
# Start-Process -PassThru kan ikkje hente ut eit prosess-handtak for slike filer
# i det heile (kastar "cannot find all the information required"), så
# $vite.Id ville anten vore utilgjengeleg eller peika på ein cmd.exe-wrapper som
# Stop-Process berre ville drept - og late sjølve vite-prosessen (og port 5173)
# leve vidare. node.exe er ein ekte .exe, så $vite.Id er den faktiske PID-en.
$vite = Start-Process -PassThru -WindowStyle Hidden -WorkingDirectory $repoRoot `
    -FilePath "node" -ArgumentList "node_modules/vite/bin/vite.js","--host","127.0.0.1"

# Vent til Vite svarer
$maxWait = 30
$ready = $false
for ($i = 0; $i -lt $maxWait; $i++) {
    try {
        Invoke-WebRequest -Uri "http://127.0.0.1:5173" -UseBasicParsing -TimeoutSec 1 | Out-Null
        $ready = $true
        break
    } catch {
        Start-Sleep -Seconds 1
    }
}
if (-not $ready) {
    Write-Warning "Vite svarte ikkje innan $maxWait sekund - held fram likevel."
}

function Set-AdbReverse {
    # adb skriv informasjonsmeldingar (t.d. "daemon not running; starting now")
    # til stderr sjølv ved suksess. Med $ErrorActionPreference = "Stop" gjer ikkje
    # PowerShell 5.1 skilnad her - stderr frå native exe-ar blir uansett pakka inn
    # i ein terminerande NativeCommandError. Difor må ErrorActionPreference
    # mjukast opp lokalt rundt kallet, og stderr fangast utan å redirigerast bort.
    $prevPref = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        adb reverse tcp:5173 tcp:5173 2>&1 | Out-Null
    } finally {
        $ErrorActionPreference = $prevPref
    }
    if ($LASTEXITCODE -eq 0) {
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - adb reverse satt opp"
    }
}

Set-AdbReverse

Write-Host "Synkroniserer Capacitor mot lokal Vite-server..."
$env:CAPACITOR_SERVER_URL = "http://localhost:5173"
npx cap sync android

Write-Host "Opnar Android Studio..."
# "npx" er her npx.ps1 (sjå Get-Command npx), ikkje ein ekte .exe. Start-Process
# kan ikkje køyre .ps1-filer direkte (same problem som er dokumentert for vite
# lenger oppe) - kallet feila difor stille, utan feilmelding, og Android Studio
# opna aldri. Køyrer i staden node.exe direkte mot @capacitor/cli sin bin-fil.
Start-Process -WorkingDirectory $repoRoot -FilePath "node" `
    -ArgumentList "node_modules/@capacitor/cli/bin/capacitor","open","android"

Write-Host ""
Write-Host "Ferdig. Kodeendringar oppdaterer WebView automatisk via Vite HMR - ikkje"
Write-Host "trengst noko meir manuelt arbeid for vanlege endringar."
Write-Host "Overvakar USB-tilkopling og setter opp 'adb reverse' på nytt automatisk..."
Write-Host "Ctrl+C for å avslutte (stoppar Vite)."

try {
    while ($true) {
        Start-Sleep -Seconds 2
        Set-AdbReverse
    }
} finally {
    Write-Host "Stoppar Vite (PID $($vite.Id))..."
    Stop-Process -Id $vite.Id -Force -ErrorAction SilentlyContinue
}
