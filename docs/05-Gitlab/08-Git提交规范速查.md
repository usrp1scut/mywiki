---
title: "Git 提交规范速查"
description: "Conventional Commits 用固定的提交信息格式说明改动类型，方便浏览历史，也便于发布工具生成版本号与变更日志。"
tags: [速查, Git]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/git-semantic-commit-memo/git-sem.memo.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

Conventional Commits 用固定的提交信息格式说明改动类型，方便浏览历史，也便于发布工具生成版本号与变更日志。

## 基本格式

```text
类型(可选范围)!: 简短说明

可选正文

可选页脚
```

范围和 `!` 都可省略。`!` 或 `BREAKING CHANGE:` 页脚用于标记不兼容变更。

```text
feat(tools): 增加二维码图片识别
fix(search): 修复中文标题匹配遗漏
docs(git): 补充撤销提交示例
```

## 常用类型

| 类型 | 用途 |
| --- | --- |
| `feat` | 新增功能 |
| `fix` | 修复问题 |
| `docs` | 文档改动 |
| `style` | 格式、空白等不改变行为的调整 |
| `refactor` | 重构，既非新增功能也非修复问题 |
| `perf` | 性能改进 |
| `test` | 测试 |
| `build` | 构建系统、依赖 |
| `ci` | 持续集成配置与脚本 |
| `chore` | 其他维护工作 |
| `revert` | 回退先前改动 |

规范定义了 `feat` 与 `fix` 的语义，也允许其他类型；具体允许哪些类型由项目配置决定。

## 正文与不兼容变更

标题写清楚改变了什么，正文补充原因、行为变化和迁移方式。下面的引用只是提交信息示例：

```text
feat(api)!: 将分页参数改为游标

列表查询使用 cursor 替代 page，避免数据变化时出现重复记录。

BREAKING CHANGE: 客户端需要移除 page 参数并传入上一页返回的 cursor。
Refs: #123
```

`BREAKING CHANGE` 要大写，页脚与正文之间留空行。GitHub 的 `Closes #123` 可能在满足平台合并条件时关闭议题，因此不要把不相关编号写进去。

## 与版本号的关系

| 变更 | 按语义化版本通常对应 |
| --- | --- |
| `fix` | 修订号 PATCH |
| `feat` | 次版本号 MINOR |
| 不兼容变更 | 主版本号 MAJOR |

这是变更语义的对应关系，**写了提交信息不会自动发布**。是否发布、`perf` 如何处理、`0.x` 的版本策略，都取决于项目使用的发布工具和规则。[规范说明](https://www.conventionalcommits.org/en/v1.0.0/)没有强制其他类型触发版本升级。

## 提交前核对

- 一个提交围绕一个能说清楚的改动，范围名保持一致。
- 避免只有「更新」「修复 bug」这类无法定位行为的标题。
- `style` 表示代码格式调整，不宜用来笼统表示所有界面功能变化。
- 使用 squash merge 时，检查最终提交信息；不少平台会默认取 PR 标题。
- commitlint 用于校验格式，发布工具用于解释历史，两者作用不同。

常用命令见 [Git 命令速查](./07-Git命令速查.md)，原有简版见 [git commit 规范](./06-git_commit.md)。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/git-semantic-commit-memo/git-sem.memo.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/05-Gitlab/08-Git提交规范速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
