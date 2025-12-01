保存为.bat，用法在cmd或powershell中输入`<filename>.bat 行数 要读取的文件名`

```batch
@echo off

if [%1] == [] goto usage
if [%2] == [] goto usage

call :print_line %1 %2
goto :eof

REM
REM print_line
REM Prints the %1 line in the file %2.
REM
:print_line
setlocal EnableDelayedExpansion
set /a counter=0

for /f "delims=*" %%i in (%2) do (
set /a counter+=1
  if !counter!==%1 (
    set lineContent=%%i 
    echo !lineContent!
  )
)

goto :eof

:usage
echo Usage: <filename>.bat COUNT FILENAME
```