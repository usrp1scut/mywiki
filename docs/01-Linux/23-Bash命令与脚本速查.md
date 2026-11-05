---
title: "Bash 命令与脚本速查"
description: "整理 Bash 的交互快捷键、变量、条件、循环、重定向和脚本排查。数组、`[[ ]]`、进程替换属于 Bash 功能，不要直接当作通用 `/bin/sh` 语法。"
tags: [速查, Linux]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/bash-memo/bash-memo.content.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

整理 Bash 的交互快捷键、变量、条件、循环、重定向和脚本排查。数组、`[[ ]]`、进程替换属于 Bash 功能，不要直接当作通用 `/bin/sh` 语法。

## 交互与历史

| 按键或命令 | 作用 |
| --- | --- |
| `Ctrl+A` / `Ctrl+E` | 移到行首 / 行尾 |
| `Ctrl+U` / `Ctrl+K` | 删除光标前 / 后的当前行内容 |
| `Ctrl+W` | 删除前一个单词 |
| `Ctrl+R` | 反向查找历史 |
| `Ctrl+C` | 向前台任务发送中断信号 |
| `Ctrl+Z` | 暂停前台任务，再用 `fg` 恢复 |
| `history` | 列出历史命令 |
| `jobs -l` | 查看当前 shell 管理的任务 |

## 变量与引用

```bash
name='wiki'                      # 等号两侧不能有空格
printf '%s\n' "$name"            # 展开变量时保留双引号
export APP_ENV=production        # 传给之后启动的子进程
APP_ENV=test ./run.sh            # 只对这一条命令生效
today=$(date +%F)
count=$((2 + 3))
printf '%s\n' "${missing:-默认值}"
printf '%s\n' "${name^^}"        # Bash 4+：大写转换
```

单引号保留字面值；双引号允许变量和命令替换，但阻止展开结果再次分词和通配。更多细节见 [Linux 变量速查](./01-Linux变量相关速查.md)。

## 数组、条件和循环

```bash
files=("a file.txt" "b.txt")
for file in "${files[@]}"; do
  if [[ -f "$file" && -r "$file" ]]; then
    printf '%s\n' "$file"
  fi
done

while IFS= read -r line || [[ -n "$line" ]]; do
  printf '%s\n' "$line"
done < input.txt

case "${1:-}" in
  start) printf '启动\n' ;;
  stop)  printf '停止\n' ;;
  *)     printf '用法：start 或 stop\n' >&2; exit 2 ;;
esac
```

| 判断 | 含义 |
| --- | --- |
| `[[ -e "$p" ]]` | 路径存在 |
| `[[ -f "$p" ]]` / `[[ -d "$p" ]]` | 普通文件 / 目录 |
| `[[ -z "$s" ]]` / `[[ -n "$s" ]]` | 空 / 非空字符串 |
| `[[ "$a" == "$b" ]]` | 字符串相等 |
| `(( count > 0 ))` | 整数比较 |

## 输入输出与管道

```bash
command >out.log 2>err.log       # 分别保存标准输出、错误输出
command >all.log 2>&1            # 合并输出；重定向顺序有意义
command >>out.log                # 追加
command | tee out.log            # 屏幕显示并写入文件
diff <(sort a.txt) <(sort b.txt)  # Bash 进程替换

cat <<'EOF'
$name 在这里不会展开
EOF
```

`2>&1 >out.log` 与 `>out.log 2>&1` 不等价：前者先让错误输出指向当时的标准输出。

## 文件与文本查询

```bash
find . -type f -name '*.log'
grep -Rni -- 'error' ./logs
tail -n 100 app.log
tail -f app.log
sort access.log | uniq -c | sort -nr | head
du -sh ./data
df -h
```

处理包含空格、换行的文件名时用 `find … -exec … {} +` 或 NUL 分隔的 `-print0`、`xargs -0`，不要把 `ls` 输出当可靠的文件清单。

## 函数与排错

```bash
log() {
  printf '[%s] %s\n' "$(date +%T)" "$*" >&2
}

bash -n script.sh                # 只检查语法
bash -x script.sh                # 执行并打印跟踪信息
shellcheck script.sh             # 安装 ShellCheck 后做静态检查
```

脚本可按需要启用 `set -euo pipefail`，但 `-e` 在条件判断、部分列表等语境有例外；预期可能失败的命令应显式处理。`-x` 会打印展开后的参数，处理密钥的脚本不要留下调试日志。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/bash-memo/bash-memo.content.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/01-Linux/23-Bash命令与脚本速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
