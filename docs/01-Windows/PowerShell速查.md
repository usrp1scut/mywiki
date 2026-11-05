---
title: "PowerShell 速查"
description: "PowerShell 的管道通常传递对象，而不是只传文本。先查对象的属性，再筛选和导出，比解析格式化后的表格更可靠。以下以 PowerShell 7 语法为主，系统管理命令还取决于操作系统和模块。"
tags: [速查, Windows]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/powershell-memo/powershell-memo.content.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

PowerShell 的管道通常传递对象，而不是只传文本。先查对象的属性，再筛选和导出，比解析格式化后的表格更可靠。以下以 PowerShell 7 语法为主，系统管理命令还取决于操作系统和模块。

## 帮助和对象

```powershell
$PSVersionTable
Get-Command -Noun Process
Get-Help Get-Process -Examples
Get-Process | Get-Member
Get-Process | Select-Object Name, Id, CPU -First 5
```

## 变量、集合和字符串

```powershell
$name = 'wiki'
$message = "Hello $name"
$items = @('api', 'web')
$config = @{ Host = 'localhost'; Port = 8080 }
$service = [PSCustomObject]@{ Name = 'web'; Healthy = $true }
$config.Port
$items.Count
```

单引号不展开变量，双引号会展开。双引号中访问属性时用 `$($config.Port)`；`$env:PATH` 表示环境变量，PowerShell 的转义符是反引号。

## 筛选、排序与导出

```powershell
Get-Process |
  Where-Object { $_.CPU -gt 10 } |
  Sort-Object CPU -Descending |
  Select-Object Name, Id, CPU

Get-ChildItem -File |
  Select-Object Name, Length |
  Export-Csv ./files.csv -NoTypeInformation -Encoding utf8

$config | ConvertTo-Json -Depth 10
Get-Content ./config.json -Raw | ConvertFrom-Json
```

`$_` 是当前管道对象。`Format-Table`、`Format-List` 应放在面向人的显示末端，不要放在 `Export-Csv`、`ConvertTo-Json` 之前。

## 文件和条件

```powershell
Get-ChildItem ./logs -Recurse -File -Filter *.log
Get-Content ./app.log -Tail 50 -Wait
Select-String -Path ./app.log -Pattern 'error'
Test-Path ./config.json
Copy-Item ./config.json ./config.backup.json -WhatIf

if (Test-Path ./config.json) {
  foreach ($line in Get-Content ./config.json) {
    Write-Output $line
  }
}
```

`-WhatIf` 仅适用于支持它的 cmdlet，用来预览将要做的操作；它不是所有外部命令都支持的通用开关。

## 请求和错误处理

```powershell
try {
  $response = Invoke-RestMethod -Uri 'https://example.com/api/status' -ErrorAction Stop
  $response
} catch {
  Write-Error "请求失败：$($_.Exception.Message)"
}
```

上面的 URL 是占位示例。`catch` 捕获终止性错误；对于会报告非终止性错误的 cmdlet，可用 `-ErrorAction Stop`。外部程序的退出码检查 `$LASTEXITCODE`，不要只依赖 `try/catch`。

## 系统与模块

```powershell
Get-Service                         # Windows 服务
Get-WinEvent -LogName System -MaxEvents 20
Get-Module -ListAvailable
Get-ExecutionPolicy -List
```

Windows PowerShell 5.1 与 PowerShell 7 在编码默认值、模块兼容和部分功能上不同；读写文件时显式指定编码。脚本执行策略也不是隔离恶意代码的安全边界，不应为运行陌生脚本盲目全局放开策略。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/powershell-memo/powershell-memo.content.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/01-Windows/PowerShell速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
