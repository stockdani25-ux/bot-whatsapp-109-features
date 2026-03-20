@echo off
:start
echo [SYSTEM] Starting bot...
node index.js
echo [SYSTEM] Bot stopped. Restarting in 3 seconds...
timeout /t 3
goto start
