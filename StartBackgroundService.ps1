param([switch]$CheckOnly)

$ErrorActionPreference = 'Stop'

$stateDir = Join-Path $PSScriptRoot 'data'
$stateFile = Join-Path $stateDir 'server.json'
$serverScript = Join-Path $PSScriptRoot 'app\server.mjs'
$bundledNode = Join-Path $PSScriptRoot 'runtime\node.exe'
$logDir = Join-Path $PSScriptRoot 'work'
$stdoutLog = Join-Path $logDir 'autostart-service.log'
$stderrLog = Join-Path $logDir 'autostart-service.err.log'

New-Item -ItemType Directory -Path $stateDir -Force | Out-Null
New-Item -ItemType Directory -Path $logDir -Force | Out-Null

if ($CheckOnly) {
    $node = if (Test-Path -LiteralPath $bundledNode) { $bundledNode } else { (Get-Command node.exe).Source }
    [pscustomobject]@{
        Root = $PSScriptRoot
        Server = $serverScript
        ServerExists = Test-Path -LiteralPath $serverScript
        Node = $node
        NodeExists = Test-Path -LiteralPath $node
        ActiveThemeExists = Test-Path -LiteralPath (Join-Path $stateDir 'active.json')
        PersistenceEnabled = if (Test-Path -LiteralPath (Join-Path $stateDir 'enabled.json')) { Get-Content -Raw -LiteralPath (Join-Path $stateDir 'enabled.json') } else { 'false' }
    }
    exit 0
}

if (Test-Path -LiteralPath $stateFile) {
    try {
        $owner = Get-Content -Raw -LiteralPath $stateFile | ConvertFrom-Json
        $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($owner.pid)" -ErrorAction SilentlyContinue
        if ($process -and $process.CommandLine.Contains($serverScript)) {
            exit 0
        }
    } catch {
        # A stale or partial state file is replaced by the server after startup.
    }
}

$listener = Get-NetTCPConnection -State Listen -LocalPort 47831 -ErrorAction SilentlyContinue
if ($listener) {
    Add-Content -LiteralPath $stderrLog -Value ("{0:u} Port 47831 is already in use; service was not started." -f (Get-Date)) -Encoding UTF8
    exit 1
}

$node = if (Test-Path -LiteralPath $bundledNode) { $bundledNode } else { (Get-Command node.exe).Source }
Start-Process -FilePath $node -ArgumentList ('"' + $serverScript + '" --recover-at-signin') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog | Out-Null
