---
name: "Jacob's wiki"
description: "青瓷与翠绿之间，以折页 J 为记的个人运维书斋。"
colors:
  primary: "#326c70"
  primary-dark: "#2b5e61"
  primary-light: "#3b7d81"
  ink-deep: "#243c33"
  ink-medium: "#30413b"
  ink-light: "#596f65"
  surface-page: "#f3f5f0"
  surface-reading: "#fafbf7"
  surface-sidebar: "#e9eee7"
  surface-code: "#edf1e9"
  surface-selected: "#dcece5"
  surface-border: "#d1dbd1"
  surface-rule: "#dce3d9"
  control-border: "#8b9e92"
  on-primary: "#ffffff"
  dark-primary: "#85cfb6"
  dark-primary-dark: "#72bea4"
  dark-primary-light: "#9cdbc6"
  dark-surface-page: "#101d21"
  dark-surface-nav: "#122328"
  dark-surface-reading: "#172b30"
  dark-surface-code: "#102126"
  dark-surface-selected: "#28483f"
  dark-surface-border: "#30464a"
  dark-surface-rule: "#2a3e42"
  dark-control-border: "#617d74"
  dark-text: "#dce6e2"
  dark-heading: "#f1f5f2"
  dark-muted: "#a4bab1"
  dark-on-primary: "#09221c"
  mark-fold: "#7caba5"
  dark-mark-fold: "#c0e8da"
typography:
  display:
    fontFamily: "'Noto Serif SC', 'Songti SC', 'STSong', 'SimSun', serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "'Noto Serif SC', 'Songti SC', 'STSong', 'SimSun', serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: "0.035em"
  section-title:
    fontFamily: "'Noto Serif SC', 'Songti SC', 'STSong', 'SimSun', serif"
    fontSize: "1.15rem"
    fontWeight: 600
    letterSpacing: "0.025em"
  article-title:
    fontFamily: "'SourceSans3', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "1.075rem"
    fontWeight: 600
    lineHeight: 1.65
  body:
    fontFamily: "'SourceSans3', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "16px"
    lineHeight: 1.75
  reading:
    fontFamily: "'SourceSans3', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "1.03rem"
    lineHeight: 1.9
  label:
    fontFamily: "'SourceSans3', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "0.9rem"
    fontWeight: 600
  poem:
    fontFamily: "'Noto Serif SC', 'Songti SC', 'STSong', 'SimSun', serif"
    fontSize: "1.05rem"
    lineHeight: 2
    letterSpacing: "0.03em"
  mono:
    fontFamily: "'JetBrains Mono', 'Noto Sans SC', 'Cascadia Code', monospace"
    fontSize: "0.9em"
  disclosure-label:
    fontFamily: "'JetBrains Mono', 'Noto Sans SC', 'Cascadia Code', monospace"
    fontSize: "0.88rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0.02em"
  blog-entry-title:
    fontSize: "1.375rem"
  blog-summary:
    fontSize: "0.95rem"
  blog-section-title:
    fontSize: "1.5rem"
  blog-subsection-title:
    fontSize: "1.2rem"
  blog-rail-label:
    fontSize: "0.8rem"
  blog-index-title-mobile:
    fontSize: "1.75rem"
  blog-article-title-mobile:
    fontSize: "1.6rem"
  blog-section-title-mobile:
    fontSize: "1.3rem"
rounded:
  compact: "3px"
  standard: "4px"
  search-shell: "5px"
  disclosure: "6px"
  tag: "999px"
spacing:
  small: "0.5rem"
  medium: "1rem"
  large: "1.5rem"
  section-inner: "2rem"
  section-gap: "3.5rem"
components:
  search-button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.compact}"
    padding: "0.5rem 1rem"
  search-button-hover:
    backgroundColor: "{colors.primary-dark}"
  search-button-dark:
    backgroundColor: "{colors.dark-primary}"
    textColor: "{colors.dark-on-primary}"
  search-button-dark-hover:
    backgroundColor: "{colors.dark-primary-dark}"
  clear-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink-medium}"
    rounded: "{rounded.standard}"
    padding: "0.4rem 0.8rem"
  poetry-button:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.standard}"
    padding: "0.3rem 0.65rem"
  notebook-input:
    backgroundColor: "{colors.surface-code}"
    textColor: "{colors.ink-medium}"
    rounded: "{rounded.standard}"
    padding: "0.7rem 0.85rem"
  topic-navigation:
    textColor: "{colors.ink-medium}"
    padding: "0.75rem 0"
  blog-tag:
    textColor: "{colors.primary}"
    rounded: "{rounded.standard}"
    padding: "0.12rem 0.55rem"
  poetry-card:
    backgroundColor: "{colors.surface-reading}"
    textColor: "{colors.ink-medium}"
    rounded: "{rounded.standard}"
    padding: "1.4rem 1.7rem"
  recent-article:
    textColor: "{colors.ink-medium}"
    padding: "1.3rem 0"
  notebook-group:
    textColor: "{colors.ink-medium}"
  disclosure:
    backgroundColor: "{colors.surface-reading}"
    rounded: "{rounded.disclosure}"
---

# Design System: Jacob's wiki

## Overview

**Creative North Star: "折页 J · 中式个人书斋"**

这是一间供自己查找、重读运维笔记的个人书斋。浅色如青瓷纸面，文字带墨绿；深色落在深墨底上，用柔和翠绿标记可操作内容。折页 J承担识别，诗词保留书卷气，技术内容保持清楚、稳定、可扫描。

本次系统记录的是现有网站的渐进整理。宋体用于站点题名、诗词和浅色阅读页的重要标题，无衬线体承载正文与控件。空间主要由留白、细线与实色表面划分；不把每条内容包进卡片，也不以模糊玻璃、发光文字或营销式眉题建立层次。

**Key Characteristics:**
- 青瓷浅纸与深墨翠绿，共用语义化表面。
- 折页 J 矢量标记是固定身份标记，诗词是书斋内容。
- 正文与目录优先可读、可检索，沿用原有技术分类。
- 开放的文章行、轻边界控件与清晰键盘焦点。

记录依据：`src/css/design-tokens.css`、`src/css/custom.css`、首页与 NotebookIndex 的组件及样式、`static/img/wiki-mark.svg`、`docusaurus.config.js`。本文件描述已实现的局部系统整理；现存页面没有涉及的视觉决策继续沿用原实现。前置 token 为规范值，深色 token 使用 `dark-` 前缀表示同一语义在深色模式下的取值；实际代码通过主题选择器覆盖同名 CSS 变量。

## Colors

青瓷色表面和墨绿色文字构成浅色阅读环境；深色模式保持同一语义关系，以深墨、灰绿正文与翠绿操作色减轻刺激。

### Primary

- **青瓷深青 / primary：** 链接、查找按钮、输入焦点与选中指示。悬停和焦点使用相邻的深浅色；不用于大面积无意义填充。
- **柔翠 / dark-primary：** 深色模式对应的操作色。填充按钮使用独立深色字色 `dark-on-primary`，保持可读性。

### Secondary

- **折页 J：** 标记主体沿用 `primary` / `dark-primary`；折角分别使用 `mark-fold` / `dark-mark-fold`。浅色墨青、深色柔翠，几何形状一致。

### Neutral

- **纸面：** `surface-page` 为首页底色，`surface-reading` 为阅读与诗笺表面，导航也使用这一浅纸色；`surface-sidebar` 划分侧栏，`surface-code` 同时供代码区和轻层次表面使用。
- **墨色：** `ink-deep` 强调题名，`ink-medium` 承载正文，`ink-light` 承载说明与元信息。浅色正文映射到 `ink-medium`。
- **界线与状态：** `surface-border` 分隔容器，`surface-rule` 分隔内容行，`control-border` 让可输入区域有更清楚的轮廓，`surface-selected` 表示选中与文本选择。
- **深墨纸面：** 深色的 page、nav、reading、code 分别有独立底色；sidebar 与 nav 共用底色，raised 与 code 共用底色。正文、标题、次要信息分别使用 `dark-text`、`dark-heading`、`dark-muted`。
- **低强度悬停：** 代码使用当前主题的 accent RGB 与透明度组合生成悬停、边线和焦点状态。这些是叠加状态，不是可替代实色阅读区的背景。

**The Paper Rule.** 承载文字的阅读区、导航和搜索浮层使用不透明表面；背景效果不得穿过文字区域。

**The Mark Rule.** 折页 J 以两个实色形状构成：斜切上横、分离折角与粗细变化的回钩形成签名感；不增加外框、纹理或图案，随主题切换配色。

## Typography

**Display Font:** Noto Serif SC，依次回退到 Songti SC、STSong、SimSun 与 serif。首页题名、诗词、站点标题使用这一书卷字体。

**Body Font:** 英文与数字使用 Source Sans 3，中文使用 Noto Sans SC；后接系统字体回退。用于正文、目录、输入、按钮及文章行标题。

**Label/Mono Font:** JetBrains Mono，中文回退 Noto Sans SC，其余回退 Cascadia Code 与 monospace；用于代码、快捷键提示和折叠块摘要。

四套字体均以 WOFF2 托管在站内，保留原始许可、可变字重和 unicode-range 字符分片，使用 font-display: swap。字体来源见 `src/fonts/README.md`；命令关闭连字。

**Character:** 宋体提供书卷感，功能文字保持克制。字体角色比装饰性字号差异更重要，中文说明按自然句子书写。

### Hierarchy

- **Display：** 首页站点题名，对应 `display`；在中窄屏收至较小字号（2.5rem）。
- **Headline：** 浅色文档一级标题，对应 `headline`；浅色二级标题为较小宋体（1.45rem），三级标题为功能字体（1.15rem）。
- **Section / Article Title：** 首页区段题名使用 `section-title`，最近文章的题名使用 `article-title`，便于连续扫描。
- **Body / Reading：** 通用文字使用 `body`，文档长文使用 `reading`。文档正文默认宽度（74ch），直接段落最大宽度（70ch）；宽屏正文容器另有放宽规则。
- **Label / Poem / Mono：** 查找标签使用 `label`，诗词正文使用 `poem`，命令使用 `mono`；折叠摘要有独立 `disclosure-label`。

深色技术文章的重要标题目前继承无衬线正文栈，这是继承实现中的局部差异，不将它另立为站点展示字体。文档在窄屏使用正文大小（1rem）与行高（1.82），一级标题大小（1.75rem）；首页诗句在手机上收为正文大小（1rem）。

**The Two Voices Rule.** 书卷字体承担题名与诗词；检索、正文、命令和操作说明维持清楚的功能字体。

## Layout

首页是已存在的两列关系：左侧查找与主题入口，右侧诗笺。页面采用完整可用宽度（100%）、包含内边距的盒模型与居中上限（1160px），外侧内边距（3rem 2rem 4rem）。列宽比例（1.2fr / 1fr），间距（3.5rem）；中屏（≤996px）收为比例（1.1fr / 1fr）、间距（2rem）与页边距（2.5rem 1.5rem 3rem）；手机（≤700px）纵向排列，页边距（1.75rem 1.25rem 3rem）。这是首页构图，不是所有页面的模板。

目录索引沿用实际侧栏分类与链接顺序。分类组采用多栏流（2 栏、理想栏宽 20rem、栏距 2.5rem），组内不拆栏；在手机断点改为一栏。目录保留篇数与分类跳转，全文搜索结果集中在 `/search`，不改变分类结构。

文档在阅读纸面上展开，最终样式取消外层文章边框与圆角。桌面文章内边距（1.75rem 2rem）；中窄屏取消多层框边占位，文章内边距为（0.5rem 0）。导航高度（60px）用于目录锚点偏移。宽屏（≥1440px）内容壳最大宽度（1560px），旁栏最大宽度（320px），正文容器最大宽度（1040px）；直接正文段落仍保持独立行长限制。

间距围绕前置 spacing 中的常用步长组合，按内容密度调整；不存在强制整站网格倍数。首页最近文章为连续行，快捷入口可换行，手机上约占两列。手机主要触控入口与按钮提供最小高度（44px）；较宽视口的文字链接保持紧凑。

技术表格保持内容宽度并限制在可用区域内，允许横向滚动；表头与代码不强行断词。移动表格保留单元格最小宽度（6rem），避免技术值被挤碎。

## Elevation & Depth

当前主要阅读路径使用平面纸张层次：正文、导航、侧栏和代码区用底色及细边线分区。文档正文与首页文章行不使用阴影。搜索结果浮层保留用于标明叠放的柔和阴影，焦点轮廓与选中左侧细线属于状态指示，不是装饰性光效。博客列表与正文同样不使用阴影，引用和代码通过独立实色区分。

### Shadow Vocabulary

- **搜索浮层边界：** `0 0 0 1px var(--surface-border), 0 8px 24px rgba(0, 0, 0, 0.12)`，由搜索组件 token 提供。
- **选中边线：** `inset 1px 0 0 var(--ifm-color-primary)`，用于深色侧栏选中项与搜索结果选中项。
- **键盘焦点：** 常规轮廓（2px、偏移 2px）；深色焦点额外保留弱强调环。输入焦点偏移收至边框，首页输入由外层统一显示轮廓。

**The Quiet Surface Rule.** 首页与博客文章行、目录和正文依靠留白、细线和底色建立层次；浮层阴影只说明叠放关系。

## Shapes

主要控件为近方形轻圆角：表格与行内代码使用 compact，输入、诗笺与常规按钮使用 standard，组合搜索框使用 search-shell，折叠块使用 disclosure。博客正文末尾标签使用 standard 圆角；列表标签是普通文字链接。正文纸面本身没有外层圆角和边框。

折页 J 以斜切上横、右上分离折角与不对称回钩构成。上横向右提起，弯钩从厚到薄收笔；折角与主体间保留 3 个 viewBox 单位的间隙，避免小尺寸粘连。轮廓由路径绘制，无外框、无纹理。导航显示大小（32px），诗词落款显示大小（30px）；通过主题图片复用浅色与深色 SVG；favicon 用系统明暗偏好选择同一标记的配色。不用字体字形、emoji 或通用图标替代。

## Components

### Buttons

查找按钮是最明确的填充操作。使用 `search-button` 与其主题、悬停变体，最小高度（44px），颜色过渡（160ms ease）。搜索结果页的刷新重试按钮使用实色底、可见边框与正文色。诗词切换为轻量文字按钮，边框透明；展开全文沿用次级描边按钮。所有交互保留键盘可见焦点。

### Chips

博客正文末尾标签使用细边框、主题色文字与轻底色悬停，不发光。列表文章的标签使用可换行文字链接；标签索引以两列开放行展示真实名称和篇数，手机上变为单列。

### Cards / Containers

诗笺是有边界的独立阅读面，使用 `poetry-card`，无阴影；标题与换诗操作同排，正文居中，作者与折页 J落在底部。长诗可收起为五行并展开，保留真实诗文。首页和博客文章列表使用开放行；博客正文与页面共享阅读底色，不增加外层卡片。

### Inputs / Fields

首页、笔记目录和搜索页复用 `SiteSearchForm`，与顶部建议共用本地全文索引，检索笔记和博客的标题、正文。提交进入 `/search?q=...`，旧 `/docs/?q=...` 链接自动转到同一结果页。组合框有明文标签与提交按钮；在中窄屏隐藏图形标记以让出输入空间。

输入表面实色，占位文字使用次要文字色而不额外降低透明度。全站 caret 使用操作主色。输入键盘焦点由组合框描边。结果页展示所属路径、命中片段和高亮；空状态提供目录入口，索引加载失败显示刷新重试，加载时显示静态占位。结果页关闭星空，维持清楚的文字阅读面。

### Navigation

导航与页脚均使用实色表面、细分隔线。导航保留原有站点结构，文字悬停与活动状态改变文字色。文档侧栏保持原技术层级，选中项加浅底色、较重字重与左侧细线；目录索引另提供带数量的分类跳转链接。

顶部全文搜索结果使用不透明浮层，选中项有底色与左侧指示线。小屏（≤576px）默认收成搜索图形宽度，输入获得焦点时扩展，并暂时让出站点题名位置；移动菜单触控按钮保持最小尺寸（44px）。

### Recent Articles / Notebook Groups

最近文章以标题、摘要和底部分隔线连续排列，标题使用功能字体，摘要保留舒适行高与最大行长（78ch）。目录组标题带右侧篇数，链接按行排列，悬停改变颜色并加下划线；数据来自实际博客与实际侧栏，不用示例内容替代。

### Blog Reading / Archive

博客采用 Read 模式。列表、标签、归档共用 `BlogLayout` 的实色阅读背景与文字导航。列表最大外宽 896px，桌面左右内距 32px；有目录的文章外宽 1100px，右侧目录 224px，间距 56px。≤996px 时目录移至正文前的原生可展开块；≤600px 时左右内距 20px，文章与标签索引变为单列。

列表每篇显示完整标题、日期、文字署名、最多 120 字的自然断句摘要及真实标签。摘要优先取 description；没有有效 description 时取正文开头的段落，不渲染隐藏的正文控件。仅有真实配图时显示缩略图，加载失败移除图片；没有配图不生成字母封面。所有文章链接与 Markdown 正文保留。

博客标题桌面 2rem，手机文章标题 1.6rem；条目标题桌面 1.375rem、手机 1.2rem；摘要 0.95rem / 1.8 行高；日期与操作 0.85rem；正文 1rem / 1.9 行高。标题末尾日期保持整体换行。代码与表格横向滚动限制在内容内部，引用为实色底加 1px 左线。

归档按年份倒序，年内保留日期与完整标题。标签索引按真实篇数排序。列表分页、标签分页、文章前后篇链接继续使用 Docusaurus 路由与元数据，结构化数据和订阅正文仍由原组件生成。博客全部路由关闭星空背景。

### Disclosures / Technical Content

折叠块使用实色阅读底、轻边框与等宽摘要，打开时摘要底色转为选中色；CSS 绘制的折角指示展开状态。技术表格以表头底色和细横线建立层次，代码保持等宽字体与独立底色。Prism 的语法色由现有配置管理，不把某类语法颜色升级为界面操作色。

常规交互使用短颜色过渡。系统检测减少动态偏好时，将动画与过渡时长收至（0.01ms），停止持续循环，并取消平滑滚动。

## Do's and Don'ts

### Do:
- **Do** 使用语义化表面和文字变量，让浅色、深色主题同步变化。
- **Do** 保留原有技术分类的顺序与名称，以目录和真实内容提供查找入口。
- **Do** 用宋体题名、诗词与小幅折页 J表达个人书斋气质。
- **Do** 保留键盘焦点、表格横向滚动和移动端足够的操作高度。
- **Do** 使用独立文章行展示首页最近文章；诗笺与浮层可以有自身边界。

### Don't:
- **Don't** 在阅读、导航或搜索浮层加入模糊背景或透明叠字。
- **Don't** 为装饰添加营销眉题、发光标题或与内容无关的图标。
- **Don't** 给折页 J 叠加边框、图景或发光效果。
- **Don't** 把首页的两列构图、诗笺容器或局部博客旧样式强制推广到所有页面。
- **Don't** 为视觉整齐重排技术分类、删去首页诗词，或把每条链接改成卡片。

博客的旧占位封面、卡片阴影、透明引用和标签光晕已清理。源码中的旧“星空”注释、未使用的印章颜色变量不代表当前视觉意图。
