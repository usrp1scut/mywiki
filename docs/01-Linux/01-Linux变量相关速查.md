# Linux 变量操作速查表

以下以 Bash 为例，数组等语法不适用于所有 `sh`。

## 变量基础操作

| 操作 | 语法 | 描述 | 示例 |
|------|------|------|------|
| **定义变量** | `变量名=值` | 创建变量（无空格） | `name="John"` |
| **读取变量** | `"$变量名"` 或 `"${变量名}"` | 获取完整变量值，保留空格 | `echo "$name"` |
| **只读变量** | `readonly 变量名` | 设置变量为只读 | `readonly PI=3.14` |
| **删除变量** | `unset 变量名` | 删除变量 | `unset temp_var` |
| **查看所有变量** | `set` 或 `declare` | 显示变量；`set` 还会列出函数 | `set \| grep USER` |

## 变量作用域

| 类型 | 设置方法 | 作用范围 | 示例 |
|------|----------|----------|------|
| **Shell 变量** | `变量名=值` | 当前 Shell；函数局部变量需用 `local` 声明 | `local_var="test"` |
| **环境变量** | `export 变量名=值` | 随后启动的子进程继承一份值，不会反向更新父进程 | `export PATH="$PATH:/bin"` |
| **配置文件中的变量** | 在配置文件中定义 | 只有读取该配置的会话才会应用 | `/etc/profile` 中定义 |

## 特殊变量

| 变量 | 描述 | 示例输出 |
|------|------|----------|
| `$0` | Shell 或当前脚本的调用名称 | `./script.sh` |
| `$1-$9` | 脚本参数1-9 | 参数值 |
| `$#` | 参数个数 | `3` |
| `"$@"` | 每个位置参数独立展开，保留原有边界 | `"arg1" "arg2" "arg3"` |
| `"$*"` | 以 `IFS` 首字符连接成一个参数，默认以空格连接 | `"arg1 arg2 arg3"` |
| `$?` | 上条命令退出状态 | `0`（成功） |
| `$$` | Shell 的 PID；在 `( … )` 子 Shell 中仍是调用者的值 | `12345` |
| `$!` | 后台最后一个进程PID | `12346` |

## 字符串操作

| 操作 | 语法 | 描述 | 示例 |
|------|------|------|------|
| **获取长度** | `${#变量名}` | 字符串长度 | `${#name}` → `4` |
| **子字符串** | `${变量名:起点:长度}` | 提取子串 | `${name:0:2}` → `Jo` |
| **删除前缀** | `${变量名#模式}` | 最短匹配删除前缀 | `${path#/}` → `usr/bin` |
| **删除后缀** | `${变量名%模式}` | 最短匹配删除后缀 | `${file%.txt}` → `document` |
| **替换** | `${变量名/模式/替换}` | 第一次替换 | `${str/old/new}` |
| **全局替换** | `${变量名//模式/替换}` | 全部替换 | `${str// /_}` |

## 数组操作

| 操作 | 语法 | 描述 | 示例 |
|------|------|------|------|
| **定义数组** | `数组名=(值1 值2 值3)` | 创建数组 | `fruits=("apple" "banana")` |
| **访问元素** | `${数组名[索引]}` | 获取元素 | `${fruits[0]}` → `apple` |
| **所有元素** | `"${数组名[@]}"` | 每个元素独立展开，保留空格 | `"${fruits[@]}"` |
| **数组长度** | `${#数组名[@]}` | 元素个数 | `${#fruits[@]}` → `2` |
| **添加元素** | `数组名+=(值)` | 追加元素 | `fruits+=("orange")` |

## 变量扩展

| 扩展方式 | 语法 | 描述 | 示例 |
|----------|------|------|------|
| **默认值** | `${变量:-默认值}` | 未设置或为空时使用默认值 | `${NAME:-"Guest"}` |
| **赋值默认值** | `${变量:=默认值}` | 未设置或为空时赋默认值 | `${COUNT:=0}` |
| **错误检查** | `${变量:?错误信息}` | 未设置或为空时报错；非交互式 Shell 退出 | `${CONFIG:?"未配置"}` |
| **存在检查** | `${变量:+替代值}` | 非空时使用替代值 | `${DEBUG:+"debug模式"}` |

## 环境变量常用命令

| 命令 | 描述 | 示例 |
|------|------|------|
| `export` | 设置环境变量 | `export JAVA_HOME=/opt/java` |
| `env` | 显示所有环境变量 | `env \| grep PATH` |
| `printenv` | 显示环境变量 | `printenv USER` |
| `set` | 列出 Shell 变量及函数，不只包含环境变量 | `set \| less` |
| `unset` | 删除变量 | `unset TEMP_VAR` |

## 常用环境变量

| 变量 | 描述 | 典型值 |
|------|------|--------|
| `PATH` | 可执行文件搜索路径 | `/usr/bin:/bin` |
| `HOME` | 用户家目录 | `/home/username` |
| `USER` | 当前用户名 | `username` |
| `SHELL` | 通常是用户的登录 Shell，不保证是当前解释器 | `/bin/bash` |
| `PWD` | 当前工作目录 | `/home/user/project` |
| `LANG` | 系统语言 | `en_US.UTF-8` |

## 实用示例

```bash
# 1. 变量定义和使用
name="Alice"
echo "Hello, $name!"  # Hello, Alice!

# 2. 命令行参数处理
echo "脚本名: $0"
echo "第一个参数: $1"
echo "参数个数: $#"

# 3. 字符串操作
filename="document.txt.backup"
echo "无后缀: ${filename%%.*}"      # document
echo "主文件名: ${filename%.*}"     # document.txt
echo "后缀: ${filename##*.}"        # backup

# 4. 数组操作
colors=("red" "green" "blue")
echo "第一个颜色: ${colors[0]}"     # red
echo "所有颜色: ${colors[@]}"       # red green blue

# 5. 默认值设置
read -p "输入用户名: " username
final_user="${username:-anonymous}"
echo "欢迎, $final_user!"
```

## 配置文件位置

| 文件 | 描述 |
|------|------|
| `~/.bashrc` | Bash 非登录交互式配置；登录时可由 profile 显式加载 |
| `~/.bash_profile` | Bash 用户登录配置 |
| `~/.profile` | Bash 登录时，没有可读的 `~/.bash_profile`、`~/.bash_login` 才读取 |
| `/etc/profile` | Bash 登录时读取的系统配置 |
| `/etc/environment` | 通常由 PAM 等登录组件读取，不是 Bash 脚本 |

> 💡 **提示**：修改 `.bashrc` 后，可在当前 Bash 中执行 `source ~/.bashrc` 或 `. ~/.bashrc`；其他已运行的终端或服务不会自动更新。

校核依据：[Bash 环境变量](https://www.gnu.org/software/bash/manual/html_node/Environment.html)、[特殊参数](https://www.gnu.org/software/bash/manual/html_node/Special-Parameters.html)、[启动文件](https://www.gnu.org/software/bash/manual/html_node/Bash-Startup-Files.html)。
