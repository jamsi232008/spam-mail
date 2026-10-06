@echo off
title Smart Spam Shield - Public Share Link (Cloudflare)
color 0B
cls
echo ===================================================================
echo       SMART SPAM SHIELD - AI EMAIL SYSTEM PUBLIC SHARE LINK
echo ===================================================================
echo.
echo  Creating an encrypted HTTPS public link for your application...
echo  This link allows anyone on ANY device (mobile, laptop, tablet)
echo  to access your running Smart Spam Shield app over the internet!
echo.

cd /d "%~dp0"

:: 1. Ensure backend is running
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% neq 0 (
    echo [*] Backend is not running on port 5000. Launching backend server...
    start "Smart Spam Shield - Backend Server" cmd /c "start_backend.bat"
    echo [*] Waiting 4 seconds for backend initialization...
    timeout /t 4 /nobreak >nul
) else (
    echo [OK] Backend server is active on port 5000.
)

:: 2. Launch Cloudflare Tunnel
echo.
echo [*] Generating secure HTTPS public link via Cloudflare Edge...
echo [*] Please wait a few seconds...
echo.

powershell -ExecutionPolicy Bypass -Command "& {
    $cf = Start-Process -FilePath '.\cloudflared.exe' -ArgumentList 'tunnel', '--url', 'http://127.0.0.1:5000' -PassThru -RedirectStandardError 'cf_tunnel_temp.log';
    $foundUrl = $null;
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1;
        if (Test-Path 'cf_tunnel_temp.log') {
            $content = Get-Content 'cf_tunnel_temp.log' -Raw -ErrorAction SilentlyContinue;
            if ($content -match 'https://[a-zA-Z0-9\-]+\.trycloudflare\.com') {
                $foundUrl = $matches[0];
                break;
            }
        }
    }
    if ($foundUrl) {
        $foundUrl | Out-File -FilePath 'PUBLIC_LINK.txt' -Encoding utf8;
        $foundUrl | Set-Clipboard;
        Clear-Host;
        Write-Host '===================================================================' -ForegroundColor Green;
        Write-Host '         SMART SPAM SHIELD IS NOW LIVE AND PUBLICLY ACCESSIBLE!    ' -ForegroundColor Green;
        Write-Host '===================================================================' -ForegroundColor Green;
        Write-Host '';
        Write-Host '  YOUR ACCESSIBLE LINK (COPIED TO CLIPBOARD):' -ForegroundColor Yellow;
        Write-Host \"  $foundUrl\" -ForegroundColor Cyan;
        Write-Host '';
        Write-Host '  DEMO CREDENTIALS:' -ForegroundColor White;
        Write-Host '  Email    : demo@spamshield.ai' -ForegroundColor Gray;
        Write-Host '  Password : password123' -ForegroundColor Gray;
        Write-Host '';
        Write-Host '  * Access this link from ANY mobile phone, tablet, or PC worldwide!' -ForegroundColor White;
        Write-Host '  * Saved to: PUBLIC_LINK.txt' -ForegroundColor Gray;
        Write-Host '===================================================================' -ForegroundColor Green;
        Write-Host 'Opening link in your default browser...';
        Start-Process $foundUrl;
        Write-Host '';
        Write-Host 'KEEP THIS WINDOW OPEN to maintain the public share link.';
        Write-Host 'Press Ctrl+C or close this window when you want to stop sharing.';
        $cf.WaitForExit();
    } else {
        Write-Host '[ERROR] Could not obtain Cloudflare Tunnel URL. Check cf_tunnel_temp.log' -ForegroundColor Red;
    }
}"
pause
