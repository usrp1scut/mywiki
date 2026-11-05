---
title: "XPath 速查"
description: "XPath 用节点关系选择 XML 或 HTML 内容。以下以 **XPath 1.0** 为基准，适用于浏览器的常见原生 XPath 接口和许多基于 libxml2 的工具。"
tags: [速查, 开发]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/xpath-memo/xpath.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

XPath 用节点关系选择 XML 或 HTML 内容。以下以 **XPath 1.0** 为基准，适用于浏览器的常见原生 XPath 接口和许多基于 libxml2 的工具。

## 路径与下标

| 表达式 | 含义 |
| --- | --- |
| `/html/body` | 从根节点逐级选择 |
| `//a` | 文档中所有 a 元素 |
| `.//a` | 当前节点后代中的 a 元素 |
| `.` / `..` | 当前节点 / 父节点 |
| `@href` | href 属性 |
| `*` / `@*` | 任意元素 / 任意属性 |
| `text()` | 文本节点 |
| `(//p)[2]` | 整个匹配集合中的第 2 个 p |
| `//p[2]` | 各父节点下排在第 2 个 p 的元素 |
| `//a \| //button` | 合并两组节点 |

XPath 的位置从 **1** 开始。局部节点查询通常需要 `.//`，直接写 `//` 可能重新从文档根开始。

## 属性、文本和 class

| 表达式 | 含义 |
| --- | --- |
| `//*[@id='main']` | id 等于 main |
| `//input[@name='email']` | name 等于 email 的 input |
| `//a[@href]` | 带 href 属性的链接 |
| `//a[starts-with(@href,'https://')]` | href 以 https 开头 |
| `//a[contains(.,'下载')]` | 整体文本包含「下载」的链接 |
| `//button[normalize-space(.)='保存']` | 归一化空白后文本为「保存」 |
| `//a/@href` | 取链接的 href 属性节点 |

class 是空白分隔的标记集合，不要用 `contains(@class,'card')` 误匹配 `card-large`：

```xpath
//*[contains(concat(' ', normalize-space(@class), ' '), ' card ')]
```

`contains(text(),'文字')` 与 `contains(.,'文字')` 不等价：XPath 1.0 把文本节点集合转成字符串时只取首个节点，`.` 则使用元素的整体字符串值。

## 轴与函数

| 表达式 | 含义 |
| --- | --- |
| `//input/parent::*` | input 的父元素 |
| `//span/ancestor::form` | span 的 form 祖先 |
| `//h2/following-sibling::p[1]` | h2 后第一个同级 p |
| `//li[last()]` | 每组同级 li 中最后一个 |
| `count(//li)` | li 数量 |
| `string(//title)` | 首个 title 的字符串值 |
| `//item[number(@price) < 10]` | 属性 price 转成数值后小于 10 |

## 命名空间与版本

XML 中默认命名空间也需要正确绑定前缀。例如把 `n` 绑定到文档命名空间 URI，再查询 `/n:root/n:item`。只用 `local-name()` 忽略命名空间可能把不同语义的节点混在一起。

`ends-with()`、`matches()`、`lower-case()` 属于 XPath 2.0+；浏览器原生 XPath、常见 xmllint 和 lxml 默认 XPath 支持不能据此假定具备这些函数。XPath 1.0 的字符串后缀判断可写成：

```xpath
//a[substring(@href, string-length(@href) - string-length('.pdf') + 1) = '.pdf']
```

这是字符串后缀判断，不会自动忽略 URL 查询参数。CSS 定位对照见 [CSS 选择器速查](./CSS选择器速查.md)。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/xpath-memo/xpath.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/09-Dev/XPath速查.md)可用于修改和再分发。

原文另致谢作者 [jmaccabee](https://gist.github.com/jmaccabee/550a0b9fcfdc7e6b170cd34c6ec7bc56)。

[返回开发运维速查目录](../00-开发运维速查.md)
