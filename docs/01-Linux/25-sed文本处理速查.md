---
title: "sed 文本处理速查"
description: "sed 按行读取文本并执行编辑脚本，适合筛选、替换和简单流处理。先查看标准输出，确认结果后再决定是否原地改写文件。"
tags: [速查, Linux]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/sed-memo/sed.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

sed 按行读取文本并执行编辑脚本，适合筛选、替换和简单流处理。先查看标准输出，确认结果后再决定是否原地改写文件。

## 选行和删除

```bash
sed -n '5p' file.txt             # 第 5 行
sed -n '3,8p' file.txt           # 第 3 到 8 行
sed -n '/BEGIN/,/END/p' file.txt # 包含起止标记的区间
sed '/^#/d' file.txt            # 删除以 # 开头的行
sed '/^[[:space:]]*$/d' file.txt # 删除空白行
sed -n '/error/p' file.txt      # 只输出匹配行
sed -n '100{p;q;}' file.txt     # 输出第 100 行后退出
```

默认会输出每轮处理后的内容；`-n` 关闭默认输出，再用 `p` 选择要打印的行。

## 替换

```bash
sed 's/old/new/' file.txt       # 每行第一次匹配
sed 's/old/new/g' file.txt      # 每行所有匹配
sed 's/old/new/2' file.txt      # 每行第二次匹配
sed 's#http://#https://#g' file.txt
sed -E 's/([0-9]+)/[\1]/g' file.txt
sed -E 's/[0-9]+/[&]/g' file.txt
sed '/^server=/s/old/new/' file.txt
```

`-E` 启用扩展正则；替换部分的 `&` 表示整个匹配，`\1` 表示第一组。要插入字面的 `&`，写成 `\&`。分隔符可以换成 `#`，减少路径中的转义。

## 原地修改与平台差异

```bash
sed -i.bak 's/old/new/g' file.txt  # GNU 和常见 BSD sed：保留 file.txt.bak
```

不留备份时，GNU sed 常用 `-i`，macOS/BSD sed 常用 `-i ''`；写跨平台脚本时不要混用。GNU 的大小写转换 `\L`、`\U` 和替换标志 `I` 也不能视为所有 sed 都支持。

## 多条命令与常见处理

```bash
sed -e 's/foo/bar/g' -e '/^#/d' file.txt
sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//' file.txt
sed 's/\r$//' file.txt           # 去除 CRLF 中行尾的 CR
sed 'N;s/\n/ /' file.txt        # 两行拼成一行，奇数末行行为需按实现核对
```

批量编辑前先用 `find` 查看范围，再传入 sed；不应对未知目录直接全量替换。JSON、YAML、XML 的结构修改应使用对应解析器，避免正则误伤字符串或嵌套结构。JSON 可参考 [jq 速查](../09-Dev/jq速查.md)。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/sed-memo/sed.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/01-Linux/25-sed文本处理速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
