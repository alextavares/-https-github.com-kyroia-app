Param(
  [int[]] $Ports = @(3025,3000),
  [switch] $CleanCache
)

Write-Host "🔄 Encerrando processos Node nos ports: $($Ports -join ', ')" -ForegroundColor Cyan

foreach ($port in $Ports) {
  try {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
      try {
        $proc = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
        if ($proc -and $proc.Name -eq 'node') {
          Write-Host "• Matando PID $($proc.Id) (node) na porta $port" -ForegroundColor Yellow
          Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
      } catch {}
    }
  } catch {}
}

Write-Host "🔎 Encerrando 'next dev' remanescente (por linha de comando)" -ForegroundColor Cyan
try {
  $procs = Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -match 'next dev' }
  foreach ($p in $procs) {
    Write-Host "• Matando PID $($p.ProcessId) (next dev)" -ForegroundColor Yellow
    Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
  }
} catch {}

if ($CleanCache) {
  Write-Host "🧹 Limpando cache .next" -ForegroundColor Magenta
  if (Test-Path .next) { Remove-Item -Recurse -Force .next }
}

Write-Host "🚀 Iniciando dev em http://localhost:3025" -ForegroundColor Green
npm run dev

