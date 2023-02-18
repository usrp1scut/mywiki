## 使用bat脚本实现head命令

用法：head.bat 行数 文件名

```batch title="head.bat"
@echo off

if [%1] == [] goto usage
if [%2] == [] goto usage

call :print_head %1 %2
goto :eof

REM
REM print_head
REM Prints the first non-blank %1 lines in the file %2.
REM
:print_head
setlocal EnableDelayedExpansion
set /a counter=0

for /f ^"usebackq^ eol^=^

^ delims^=^" %%a in (%2) do (
        if "!counter!"=="%1" goto :eof
        echo %%a
        set /a counter+=1
)

goto :eof

:usage
echo Usage: head.bat COUNT FILENAME
```