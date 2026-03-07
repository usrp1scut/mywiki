# Windows 11 初始化配置

## 适用场景

- 新装 Windows 11，OOBE 首次开机流程要求联网。
- 需要临时启用内置 `Administrator` 账户进行排障或初始化。

## 1. 首次开机跳过联网（OOBE）

### 方法 A：`OOBE\BYPASSNRO`（优先尝试）

1. 在“让我们为你连接到网络”页面，按 `Shift + F10` 打开命令行。
2. 执行：

```bat
OOBE\BYPASSNRO
```

3. 设备会自动重启，回到 OOBE 后可看到“我没有 Internet 连接”或“继续执行受限设置”，按离线流程继续。

### 方法 B：手动写入注册表（当方法 A 不可用时）

1. 仍在 OOBE 页面按 `Shift + F10` 打开命令行。
2. 执行以下命令：

```bat
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\OOBE" /v BypassNRO /t REG_DWORD /d 1 /f
shutdown /r /t 0
```

3. 重启后继续离线安装。

## 2. 启用内置 Administrator

完成安装进入系统后，以“管理员权限”打开命令提示符，执行：

```bat
net user Administrator /active:yes
```

可选：立即设置密码（推荐）

```bat
net user Administrator "你的强密码"
```

如果系统语言导致账户名不同，可尝试：

```bat
net user 管理员 /active:yes
```

不再需要时可关闭内置账户：

```bat
net user Administrator /active:no
```

## 3. 安全建议

- 内置 `Administrator` 权限过高，不建议长期作为日常账户使用。
- 建议完成初始化后改回普通管理员账户，`Administrator` 仅在维护时启用。

## 4. 激活

[MAS](https://massgrave.dev/) 激活 Windows ：

英文原版
```
irm https://get.activated.win | iex
```

汉化版本
```
 irm https://gitee.com/cmontage/mas-cn/raw/main/GETMASCN.ps1 | iex
```
