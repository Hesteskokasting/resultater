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

function Test-ViteIPv4 {
    # adb reverse sender alltid vidare til IPv4 127.0.0.1 på verten. Ein dev-server
    # som berre lyttar på ::1 (IPv6-loopback) gjev "connection refused" i WebView-en,
    # som viser seg som "Ingen internettforbindelse". Difor må testen vere IPv4-spesifikk.
    try {
        Invoke-WebRequest -Uri "http://127.0.0.1:5173" -UseBasicParsing -TimeoutSec 1 | Out-Null
        return $true
    } catch {
        return $false
    }
}

$vite = $null
$portInUse = [bool](Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue)

if ($portInUse) {
    Write-Host "Port 5173 er allereie i bruk - startar ikkje ny Vite."
    if (-not (Test-ViteIPv4)) {
        throw @"
Noko lyttar på port 5173, men ikkje på IPv4 127.0.0.1 (truleg berre ::1).
adb reverse sender vidare til IPv4, så WebView-en får "connection refused".
Stopp den køyrande dev-serveren og køyr dette scriptet på nytt, eller start han
med: vp dev --host 127.0.0.1
"@
    }
    Write-Host "Eksisterande dev-server svarer på 127.0.0.1:5173 - brukar den."
} else {
    Write-Host "Startar Vite dev-server (127.0.0.1:5173)..."

    # Køyrer node.exe direkte mot vite-plus sin bin-fil (ikkje "npm run dev" eller
    # "npx vite") - både npm og npx er .cmd/.ps1-filer på Windows, ikkje ekte .exe.
    # Start-Process -PassThru kan ikkje hente ut eit prosess-handtak for slike filer
    # i det heile (kastar "cannot find all the information required"), så
    # $vite.Id ville anten vore utilgjengeleg eller peika på ein cmd.exe-wrapper som
    # Stop-Process berre ville drept - og late sjølve vite-prosessen (og port 5173)
    # leve vidare. node.exe er ein ekte .exe, så $vite.Id er den faktiske PID-en.
    #
    # NB: "vite" i node_modules er eit alias for @voidzero-dev/vite-plus-core, som
    # ikkje har nokon bin-fil i det heile. Bruk vite-plus sin eigen bin.js.
    $viteBin = Join-Path $repoRoot "node_modules/vite-plus/dist/bin.js"
    if (-not (Test-Path $viteBin)) {
        throw "Fann ikkje $viteBin - køyr 'npm install' først."
    }
    $vite = Start-Process -PassThru -WindowStyle Hidden -WorkingDirectory $repoRoot `
        -FilePath "node" -ArgumentList $viteBin,"dev","--host","127.0.0.1"

    # Vent til Vite svarer
    $maxWait = 30
    $ready = $false
    for ($i = 0; $i -lt $maxWait; $i++) {
        if ($vite.HasExited) {
            throw "Vite-prosessen avslutta med kode $($vite.ExitCode) rett etter oppstart."
        }
        if (Test-ViteIPv4) {
            $ready = $true
            break
        }
        Start-Sleep -Seconds 1
    }
    if (-not $ready) {
        Stop-Process -Id $vite.Id -Force -ErrorAction SilentlyContinue
        throw "Vite svarte ikkje på http://127.0.0.1:5173 innan $maxWait sekund - avbryt."
    }
    Write-Host "Vite svarer på 127.0.0.1:5173."
}

if (-not (Get-Command adb -ErrorAction SilentlyContinue)) {
    throw "Fann ikkje 'adb' på PATH - legg til <Android SDK>\platform-tools."
}

$script:lastAdbOk = $null

function Set-AdbReverse {
    # adb skriv informasjonsmeldingar (t.d. "daemon not running; starting now")
    # til stderr sjølv ved suksess. Med $ErrorActionPreference = "Stop" gjer ikkje
    # PowerShell 5.1 skilnad her - stderr frå native exe-ar blir uansett pakka inn
    # i ein terminerande NativeCommandError. Difor må ErrorActionPreference
    # mjukast opp lokalt rundt kallet, og stderr fangast utan å redirigerast bort.
    $prevPref = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    # Nullstill før kallet - elles kan ein gammal exit-kode frå ein tidlegare
    # kommando bli lesen som suksess viss adb-kallet aldri kjem så langt.
    $global:LASTEXITCODE = $null
    try {
        adb reverse tcp:5173 tcp:5173 2>&1 | Out-Null
    } finally {
        $ErrorActionPreference = $prevPref
    }
    # Skriv berre når tilstanden endrar seg - loopen køyrer annakvart sekund.
    $ok = ($LASTEXITCODE -eq 0)
    if ($ok -ne $script:lastAdbOk) {
        if ($ok) {
            Write-Host "$(Get-Date -Format 'HH:mm:ss') - adb reverse satt opp"
        } else {
            Write-Warning "$(Get-Date -Format 'HH:mm:ss') - adb reverse feila (er eininga tilkopla og USB-debugging på?)"
        }
        $script:lastAdbOk = $ok
    }
}

Set-AdbReverse
if (-not $script:lastAdbOk) {
    throw "Fekk ikkje sett opp 'adb reverse' - sjekk 'adb devices'."
}

Write-Host "Synkroniserer Capacitor mot lokal Vite-server..."
$env:CAPACITOR_SERVER_URL = "http://localhost:5173"
node "$repoRoot/node_modules/@capacitor/cli/bin/capacitor" sync android
if ($LASTEXITCODE -ne 0) {
    throw "'cap sync android' feila med kode $LASTEXITCODE."
}

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
    if ($vite) {
        Write-Host "Stoppar Vite (PID $($vite.Id))..."
        Stop-Process -Id $vite.Id -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host "Let den eksisterande dev-serveren stå."
    }
}
