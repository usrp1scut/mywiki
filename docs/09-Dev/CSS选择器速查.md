---
title: "CSS 选择器速查"
description: "按元素、关系、属性和状态选择网页节点。选择器负责匹配元素；最终样式还要经过来源、层、重要性、优先级和顺序等层叠规则。"
tags: [速查, 开发]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/css-selectors-memo/css-selectors.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

按元素、关系、属性和状态选择网页节点。选择器负责匹配元素；最终样式还要经过来源、层、重要性、优先级和顺序等层叠规则。

## 基础与关系

| 选择器 | 匹配 |
| --- | --- |
| `p` | p 元素 |
| `.card` / `#main` | class / id |
| `*` | 任意元素 |
| `h1, h2` | 两类元素的并集 |
| `.card a` | card 内任意层级的 a 后代 |
| `.card > a` | card 的直接 a 子元素 |
| `h2 + p` | 紧邻 h2 后面的同级 p |
| `h2 ~ p` | h2 后面所有同级 p |

## 属性

| 选择器 | 含义 |
| --- | --- |
| `[disabled]` | 存在该属性 |
| `[type="text"]` | 属性值完全相同 |
| `[class~="card"]` | 空白分隔的属性标记中包含 card |
| `[lang\|="zh"]` | 值是 zh 或以 zh- 开头 |
| `[href^="https://"]` | 属性值以指定内容开头 |
| `[href$=".pdf"]` | 属性值以指定内容结尾 |
| `[href*="docs"]` | 属性值包含指定片段 |
| `[type="TEXT" i]` | ASCII 范围内忽略大小写匹配 |

## 结构、状态和伪元素

| 选择器 | 含义 |
| --- | --- |
| `li:first-child` / `li:last-child` | 是父元素首个 / 末个子元素的 li |
| `p:nth-of-type(2)` | 同级 p 中第 2 个 |
| `li:nth-child(2n)` | 位于偶数子元素位置的 li |
| `:checked` / `:disabled` | 已选中 / 已禁用控件 |
| `:hover` / `:active` | 指针悬停 / 激活状态 |
| `:focus` / `:focus-visible` | 已聚焦 / 浏览器认为需要显示焦点指示 |
| `:focus-within` | 自己或后代获得焦点 |
| `::before` / `::after` | 元素内容前后的生成内容 |
| `::placeholder` / `::selection` | 占位文本 / 被选中的文本部分 |

`::before`、`::after` 通常要设置 `content` 才会生成内容；键盘焦点不能只依靠 hover 样式表达。

## 函数式选择器

```css
:is(h1, h2, h3) > code { font-size: 0.9em; }
:where(.article) a { text-decoration: underline; }
li:not(.done) { font-weight: bold; }
article:has(> img) { padding-top: 1rem; }
```

`:is()` 匹配列表中任一项，`:not()` 排除匹配，`:has()` 按相对选择器是否能匹配来选择当前元素。旧浏览器环境需核对支持情况。

## 优先级

在其他层叠条件相同的情况下，按 **ID、类/属性/伪类、元素/伪元素** 三列从左到右比较：

| 选择器 | 优先级 |
| --- | --- |
| `#main .item a` | 1-1-1 |
| `.menu .item a` | 0-2-1 |
| `:where(#main) a` | 0-0-1 |

通配符、组合符不增加优先级；`:where()` 连同参数的优先级为零。`:is()`、`:not()`、`:has()` 取参数列表中最高的优先级。不能仅凭「写在后面」或「有 ID」忽略 `!important`、层叠层和样式来源。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/css-selectors-memo/css-selectors.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/09-Dev/CSS选择器速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
