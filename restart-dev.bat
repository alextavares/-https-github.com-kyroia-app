@echo off
setlocal

REM Caminho da pasta scripts relativo a este .bat
set SCRIPT_DIR=%~dp0scripts

if not exist "%SCRIPT_DIR%\restart-dev.ps1" (
  echo [ERRO] Nao encontrei "%SCRIPT_DIR%\restart-dev.ps1".
  echo Certifique-se de que o repo foi clonado completo.
  exit /b 1
)

echo 🔄 Reiniciando dev no porto 3025 via PowerShell...
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%\restart-dev.ps1" -CleanCache

endlocal
