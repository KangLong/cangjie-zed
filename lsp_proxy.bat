@echo off
REM LSPServer proxy - captures LSP initialize request
set LOGFILE=G:\Work\Projects\Self\cangjie-zed\lsp_capture.json

REM Check if this is the first invocation (initialize request)
REM The initialize request contains "method":"initialize"
set /p INIT_DATA=
echo %INIT_DATA% > "%LOGFILE%"

REM Forward to real LSPServer
echo %INIT_DATA% | "%~dp0LSPServer_real.exe" %*
