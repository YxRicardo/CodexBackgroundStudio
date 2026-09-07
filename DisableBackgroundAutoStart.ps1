$ErrorActionPreference = 'Stop'
$runKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
$valueName = 'CodexBackgroundStudio'

if ((Get-ItemProperty -LiteralPath $runKey -Name $valueName -ErrorAction SilentlyContinue).$valueName) {
    Remove-ItemProperty -LiteralPath $runKey -Name $valueName
    Write-Output 'Codex Background Studio automatic startup disabled.'
} else {
    Write-Output 'Codex Background Studio automatic startup was not enabled.'
}
