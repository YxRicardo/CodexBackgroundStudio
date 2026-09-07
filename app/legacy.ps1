param([string]$BackupPath)
$ErrorActionPreference='Stop'
$state=Join-Path $env:LOCALAPPDATA 'AzureReverie/watcher.json'
if (Test-Path -LiteralPath $state) {
 $owner=Get-Content -LiteralPath $state -Raw | ConvertFrom-Json
 $proc=Get-CimInstance Win32_Process -Filter "ProcessId = $($owner.pid)" -ErrorAction SilentlyContinue
 if ($proc -and $proc.Name -eq 'node.exe' -and $proc.CommandLine -eq $owner.commandLine) {
  $match=[regex]::Match($proc.CommandLine,'--theme\s+"([^"]+)"')
  if (!$match.Success) {throw 'Cannot identify owned theme package; leaving watcher unchanged.'}
  if (!(Test-Path -LiteralPath $BackupPath)) {Copy-Item -LiteralPath $match.Groups[1].Value -Destination $BackupPath}
  Stop-Process -Id $proc.ProcessId
 }
}
