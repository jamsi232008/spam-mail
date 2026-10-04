@echo off
title Smart Spam Shield - Public Share Link
color 0B
cls
echo ===================================================================
echo             SMART SPAM SHIELD - PUBLIC ACCESS TUNNEL
echo ===================================================================
echo.
echo  Creating an encrypted HTTPS public link for your application...
echo  This link allows anyone on the internet to access your running app!
echo.
echo  Connecting...
echo ===================================================================
echo.
ssh -o StrictHostKeyChecking=no -R 80:localhost:5173 nokey@localhost.run
pause
