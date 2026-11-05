---
title: "Git 命令速查"
description: "按日常工作顺序查询 Git 命令：检查改动、暂存提交、切换分支、同步远端，以及撤销和恢复。代码中的 `<文件>`、`<分支>`、`<提交>` 都需要替换为实际值。"
tags: [速查, Git]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/git-memo/git-memo.content.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

按日常工作顺序查询 Git 命令：检查改动、暂存提交、切换分支、同步远端，以及撤销和恢复。代码中的 `<文件>`、`<分支>`、`<提交>` 都需要替换为实际值。

## 配置与创建仓库

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --local user.email "work@example.com"  # 只影响当前仓库
git config --list --show-origin                  # 查看配置及来源
git init
git clone <仓库URL>
git clone --recurse-submodules <仓库URL>
```

`clone` 用于取得完整仓库；`pull` 用于在已有仓库中获取并整合远端更新。

## 查看与暂存

| 目的 | 命令 |
| --- | --- |
| 简要状态及分支 | `git status -sb` |
| 工作区与暂存区的差异 | `git diff` |
| 暂存区与当前提交的差异 | `git diff --staged` |
| 变更文件统计 | `git diff --stat` |
| 暂存指定文件 | `git add -- <文件>` |
| 逐块选择改动 | `git add -p -- <文件>` |
| 暂存整个仓库的新增、修改和删除 | `git add -A` |
| 取消暂存，保留文件改动 | `git restore --staged -- <文件>` |
| 停止跟踪，但保留本地文件 | `git rm --cached -- <文件>` |
| 查找生效的忽略规则 | `git check-ignore -v <文件>` |

## 提交与分支

```bash
git commit -m "feat: 增加配置导出"
git commit --amend                 # 修改最近一次提交
git branch -vv                    # 分支、上游及最后一次提交
git switch -c feature/export       # 新建并切换
git switch main
git branch -m <旧分支> <新分支>
git branch -d <已合并的分支>
```

`git commit -am` 只自动暂存已跟踪文件的修改和删除，不包含新文件。`--amend` 会生成新的提交，改写已共享的历史前要与协作者协调。提交信息格式参见 [Git 提交规范速查](./08-Git提交规范速查.md)。

## 远端同步

```bash
git remote -v
git remote add origin <仓库URL>
git remote set-url origin <仓库URL>
git fetch origin --prune
git log --oneline HEAD..origin/main
git pull --ff-only
git push -u origin <分支>
```

`fetch` 更新远端跟踪引用，不把改动合并进工作区；`pull --ff-only` 只允许快进，分叉时会停止。需要合并或变基时明确选择下面的操作。

## 合并与变基

```bash
git merge <分支>
git merge --abort                 # 放弃正在进行的合并
git rebase origin/main           # 将当前分支的提交重放到远端 main 上
git rebase -i HEAD~3              # 交互整理最近 3 次提交
git rebase --abort
```

冲突时先运行 `git status`，编辑冲突文件，删除冲突标记，再 `git add -- <文件>`。合并用 `git merge --continue`，变基用 `git rebase --continue`。变基会改变提交标识，尤其要避免自行改写共享分支。

## 临时保存与选择性移植

```bash
git stash push -u -m "切换任务前的草稿"  # 包含未跟踪文件，不包含忽略文件
git stash list
git stash show -p 'stash@{0}'
git stash apply 'stash@{0}'             # 应用但保留记录
git stash pop                          # 成功应用后移除记录
git cherry-pick <提交>
git cherry-pick --continue
git cherry-pick --abort
```

## 历史、标签与排查

```bash
git log --oneline --graph --decorate --all
git log --follow -- <文件>
git log -S"关键字" -- <文件>
git show <提交>
git blame -L 10,40 -- <文件>
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
git bisect start
git bisect bad <异常提交>
git bisect good <正常提交>
# 每轮验证后标记 git bisect good 或 git bisect bad
git bisect reset
```

## 撤销与恢复

| 情况 | 操作 | 影响 |
| --- | --- | --- |
| 只取消暂存 | `git restore --staged -- <文件>` | 保留工作区改动 |
| 丢弃指定文件的未暂存修改 | `git restore -- <文件>` | 用暂存区内容覆盖工作区，改动会丢失 |
| 撤回本地最近一次提交，保留暂存 | `git reset --soft HEAD~1` | 移动分支，保留暂存区和工作区 |
| 撤回提交并取消暂存 | `git reset --mixed HEAD~1` | 保留工作区，重置暂存区 |
| 撤回提交并覆盖文件 | `git reset --hard HEAD~1` | 会丢弃相关工作区改动，慎用 |
| 撤销已共享提交 | `git revert <提交>` | 创建反向提交，不改写原历史 |
| 找回曾指向的提交 | `git reflog`，再 `git switch -c rescue <提交>` | 在新分支上保留找到的提交 |

reflog 是本地引用变动记录，会过期且受垃圾回收影响，不能当备份，也不能保证找回从未提交的文件。参见 [Git reflog 文档](https://git-scm.com/docs/git-reflog)。

清理未跟踪文件前先预览：

```bash
git clean -nd    # 预览未跟踪文件和目录
git clean -fd    # 确认清单后再删除
```

`-x` 还会包含被忽略的文件，例如本地配置和构建目录，不应作为日常默认参数。

## 子模块与多个工作区

```bash
git submodule update --init --recursive
git submodule status
git worktree add ../wiki-fix -b fix/docs
git worktree list
git worktree remove ../wiki-fix
```

子模块更新后，父仓库还需要提交它记录的子模块版本。worktree 适合同时处理不同分支，移除前先确认其中没有未保存的改动。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/git-memo/git-memo.content.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/05-Gitlab/07-Git命令速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
