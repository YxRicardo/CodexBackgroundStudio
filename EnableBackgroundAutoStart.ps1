param([switch]$CheckOnly)

$ErrorActionPreference = 'Stop'
$runKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
$valueName = 'CodexBackgroundStudio'
$serviceScript = Join-Path $PSScriptRoot 'StartBackgroundService.ps1'

if (!(Test-Path -LiteralPath $serviceScript)) {
    throw "Cannot find the background service launcher: $serviceScript"
}

$command = 'powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $serviceScript + '"'
$existing = (Get-ItemProperty -LiteralPath $runKey -Name $valueName -ErrorAction SilentlyContinue).$valueName

if ($CheckOnly) {
    [pscustomobject]@{
        enabled = ($existing -eq $command)
        command = $existing
    } | ConvertTo-Json -Compress
    exit 0
}

New-Item -Path $runKey -Force | Out-Null
New-ItemProperty -LiteralPath $runKey -Name $valueName -PropertyType String -Value $command -Force | Out-Null
Write-Output 'Codex Background Studio will restore the active background after this user signs in.'
