$ErrorActionPreference='Stop'
$state=Join-Path $PSScriptRoot 'data/server.json'
if (Test-Path -LiteralPath $state) {
 $owner=Get-Content -LiteralPath $state -Raw | ConvertFrom-Json
 $proc=Get-CimInstance Win32_Process -Filter "ProcessId = $($owner.pid)" -ErrorAction SilentlyContinue
 $expected=Join-Path $PSScriptRoot 'app/server.mjs'
 if ($proc -and $proc.ExecutablePath -eq (Join-Path $PSScriptRoot 'runtime/node.exe') -and $proc.CommandLine.Contains($expected)) {Stop-Process -Id $proc.ProcessId}
}
