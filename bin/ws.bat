@echo off
set cmd1=%1
set cmd2=%2
set cmd3=%3

if "%cmd1%"=="server" (
    if "%cmd2%"=="start" (
        REM Ganti path di bawah dengan lokasi asli file server.js kamu
        node "C:\WS - Control - Panel\server.js"
        goto :eof
    )
)

if "%cmd1%"=="info" (
    echo WS version 0.0.1 Copyright 2025
    goto :eof
)

echo Perintah tidak ditemukan. Ketik:
echo     ws server start   - untuk memulai server
echo     ws info           - untuk melihat info Web Script
