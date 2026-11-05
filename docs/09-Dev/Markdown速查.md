---
title: "Markdown 速查"
description: "整理知识库写作常用的 Markdown 语法，并区分标准写法和渲染器扩展。本仓库由 Docusaurus 处理 Markdown/MDX，普通文本里的尖括号和花括号可能被当作语法。"
tags: [速查, 开发]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/markdown-cheatsheet/md-memo.content.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

整理知识库写作常用的 Markdown 语法，并区分标准写法和渲染器扩展。本仓库由 Docusaurus 处理 Markdown/MDX，普通文本里的尖括号和花括号可能被当作语法。

## 标题与段落

```markdown
# 文档标题

## 主要章节

第一段正文。

第二段正文。
```

有 front matter `title` 的页面可让主题显示标题，不再重复写同名一级标题。段落之间留空行；不要用连续空格代替结构化排版。

## 强调、列表与引用

```markdown
**加粗**、*斜体*、~~删除线~~、`行内代码`

- 第一项
- 第二项

1. 第一步
2. 第二步

> 引用内容

- [x] 已完成
- [ ] 未完成
```

删除线、任务列表属于常见扩展，跨平台粘贴前确认目标渲染器支持。

## 链接与图片

```markdown
[可读的链接文字](https://example.com)
[同目录笔记](./另一篇笔记.md)
![说明图片内容的替代文本](./example.png)
```

仓库内文档优先使用真实 `.md` 相对路径，构建器会解析路由并检查链接。不要只写「点这里」，图片应提供有意义的替代文本。

## 代码块与表格

````markdown
```bash
git status
```

| 项目 | 含义 |
| --- | --- |
| `-n` | 预览操作 |
````

围栏后写语言名可启用高亮。示例本身含三个反引号时，外层围栏用四个或更多。表格单元格中的竖线需要写成 `\|`，包括行内代码中的竖线。

## MDX 与 Docusaurus

````markdown
---
title: 笔记标题
description: 说明这篇笔记能查到什么。
tags:
  - 速查
---

:::tip 相关工具

[JSON 格式化](/tools#json)

:::

命令参数写成 `<文件>`，代码对象写在代码块里。
````

文中的 `<文件>`、`{key: value}` 应放入行内代码或代码块，避免被 MDX 当成标签或表达式。HTML 嵌入应符合 JSX 语法；普通笔记尽量使用原生 Markdown。

脚注、定义列表、`==高亮==`、特殊标题 ID 的支持因渲染器而异，不要仅因另一个网站能显示就直接照搬。写作结构可参考 [现有写作模板](../00-写作模板.md)。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/markdown-cheatsheet/md-memo.content.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/09-Dev/Markdown速查.md)可用于修改和再分发。

原文参考 [Markdown Guide](https://www.markdownguide.org/cheat-sheet/)，本页另补充了本仓库的 MDX 写作注意事项。

[返回开发运维速查目录](../00-开发运维速查.md)
