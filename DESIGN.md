---
name: "Jacob's wiki"
description: "纸白与墨色的个人运维书斋，暗色以炭灰和冷蓝定位，以折页 J 为记。"
colors:
  primary: "#326c70"
  primary-dark: "#2b5e61"
  primary-light: "#3b7d81"
  ink-deep: "#171717"
  ink-medium: "#242424"
  ink-light: "#595959"
  surface-page: "#f5f5f5"
  surface-reading: "#fcfcfc"
  surface-sidebar: "#f0f0f0"
  surface-code: "#f2f2f2"
  surface-selected: "#e9e9e9"
  surface-border: "#cccccc"
  surface-rule: "#dedede"
  control-border: "#858585"
  on-primary: "#ffffff"
  action-fill: "#303030"
  action-fill-hover: "#171717"
  dark-primary: "#96b9e5"
  dark-primary-dark: "#80a7d8"
  dark-primary-light: "#afcbef"
  dark-surface-page: "#141414"
  dark-surface-nav: "#1b1b1b"
  dark-surface-reading: "#202020"
  dark-surface-code: "#161616"
  dark-surface-selected: "#303030"
  dark-surface-border: "#454545"
  dark-surface-rule: "#383838"
  dark-control-border: "#808080"
  dark-text: "#e6e6e6"
  dark-heading: "#f5f5f5"
  dark-muted: "#b5b5b5"
  dark-on-primary: "#141414"
  mark-ink: "#326c70"
  dark-mark-ink: "#96b9e5"
  mark-fold: "#7caba5"
  dark-mark-fold: "#d9e7f8"
  poetry-header: "#292929"
  poetry-fold: "#858585"
  dark-poetry-header: "#151515"
  dark-poetry-fold: "#686868"
typography:
  display:
    fontFamily: "'Noto Serif SC', 'Songti SC', 'STSong', 'SimSun', serif"
    fontSize: "clamp(2.5rem, 4vw, 3.5rem)"
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
    fontSize: "1.0625rem"
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
    backgroundColor: "{colors.action-fill}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.compact}"
    padding: "0.5rem 1rem"
  search-button-hover:
    backgroundColor: "{colors.action-fill-hover}"
  search-button-dark:
    backgroundColor: "{colors.dark-primary}"
    textColor: "{colors.dark-on-primary}"
  search-button-dark-hover:
    backgroundColor: "{colors.dark-primary-light}"
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

这是一间供自己查找、重读运维笔记的个人书斋。浅色使用中性纸白、深灰正文和墨色诗笺书口，深色使用炭灰与浅灰正文，以冷蓝标记操作和当前位置；青瓷只保留在折页 J 与浅色少量链接、焦点上。折页 J 承担识别，诗词保留书卷气，技术内容保持清楚、稳定、可扫描。

本次系统记录的是现有网站的渐进整理。宋体用于站点题名、诗词和浅色阅读页的重要标题，无衬线体承载正文与控件。空间主要由留白、细线与实色表面划分；不把每条内容包进卡片，也不以模糊玻璃、发光文字或营销式眉题建立层次。

**Key Characteristics:**
- 中性纸白、墨色与炭灰表面；浅色少量青瓷链接，暗色冷蓝交互强调。
- 折页 J 矢量标记是固定身份标记，诗词是书斋内容。
- 正文与目录优先可读、可检索，沿用原有技术分类。
- 开放的文章行、轻边界控件与清晰键盘焦点。

记录依据：`src/css/design-tokens.css`、`src/css/custom.css`、首页与 NotebookIndex 的组件及样式、`static/img/wiki-mark.svg`、`docusaurus.config.js`。本文件描述已实现的局部系统整理；现存页面没有涉及的视觉决策继续沿用原实现。前置 token 为规范值，深色 token 使用 `dark-` 前缀表示同一语义在深色模式下的取值；实际代码通过主题选择器覆盖同名 CSS 变量。

## Colors

浅色使用中性纸白（#fcfcfc）、深灰正文（#242424）、浅灰侧栏与代码底色；深色使用炭灰阅读底（#202020）与浅灰正文（#e6e6e6）。诗笺书口、折角、分割线、滚动条和选中背景都使用中性色，避免零散色块共同形成偏绿印象。浅色 Logo 与少量链接使用青瓷，暗色 Logo 与操作使用冷蓝。

### Primary

- **青瓷深青 / primary：** 浅色的小面积链接与输入焦点；填充操作另用墨色 `action-fill`，不沿用链接色铺背景。
- **冷蓝 / dark-primary：** 深色的链接、焦点、定位细线与操作色；选中行保持中性灰底、浅灰字。填充按钮使用独立深色字色 `dark-on-primary`，保持可读性。

### Secondary

- **折页 J：** 标记主体独立使用 `mark-ink` / `dark-mark-ink`；折角分别使用 `mark-fold` / `dark-mark-fold`。浅色墨青，深色冷蓝与冰蓝折角，几何形状一致。暗色主体与交互强调同色，不向阅读底色或诗笺折角扩散。导航、首页落款和 favicon 的暗色版本同步使用这组颜色；favicon 跟随系统明暗偏好。

### Neutral

- **纸面：** `surface-page` 为首页底色，`surface-reading` 为阅读与诗笺表面，导航也使用这一浅纸色；`surface-sidebar` 划分侧栏，`surface-code` 同时供代码区和轻层次表面使用。
- **墨色：** `ink-deep` 强调题名，`ink-medium` 承载正文，`ink-light` 承载说明与元信息。浅色正文映射到 `ink-medium`。
- **界线与状态：** `surface-border` 分隔容器，`surface-rule` 分隔内容行，`control-border` 让可输入区域有更清楚的轮廓，`surface-selected` 表示选中与文本选择。
- **深墨纸面：** 深色的 page、nav、reading、code 分别有独立底色；sidebar 比 nav 略深，raised 比 reading 略亮，代码使用更深的独立底色。正文、标题、次要信息分别使用 `dark-text`、`dark-heading`、`dark-muted`。
- **低强度悬停：** 普通行与控件使用当前主题的中性 `surface-hover`；accent RGB 只用于小面积焦点、关键词高亮等状态，不用于长边线或整片阅读背景。

**The Paper Rule.** 承载文字的阅读区、导航和搜索浮层使用不透明表面；背景效果不得穿过文字区域。

**The Neutral Reading Rule.** 阅读底色、正文、目录文字、边线、选中背景、滚动条及代码普通文本使用中性色。不能只检查正文底色，还需检查书口、按钮、选中条和长分割线的累计色彩面积。青绿收缩到浅色 Logo 与少量链接；暗色 Logo 和操作统一用冷蓝，语法色承担代码分类。先验收静态阅读的舒适度，再验收动效；对比度达标不能替代实际视觉判断。

**The Mark Rule.** 折页 J 以两个实色形状构成：斜切上横、分离折角与粗细变化的回钩形成签名感；不增加外框、纹理或图案，随主题切换配色。

## Typography

**Display Font:** Noto Serif SC，依次回退到 Songti SC、STSong、SimSun 与 serif。首页题名、诗词、站点标题使用这一书卷字体。

**Body Font:** 英文与数字使用 Source Sans 3，中文使用 Noto Sans SC；后接系统字体回退。用于正文、目录、输入、按钮及文章行标题。

**Label/Mono Font:** JetBrains Mono，中文回退 Noto Sans SC，其余回退 Cascadia Code 与 monospace；用于代码、快捷键提示和折叠块摘要。

四套字体均以 WOFF2 托管在站内，保留原始许可、可变字重和 unicode-range 字符分片，使用 font-display: swap。字体来源见 `src/fonts/README.md`；命令关闭连字。首页与诗词另有可变字体小分片，完整字库继续回退，所有 WOFF2 独立缓存，不嵌入 CSS。

**Character:** 宋体提供书卷感，功能文字保持克制。字体角色比装饰性字号差异更重要，中文说明按自然句子书写。

### Hierarchy

- **Display：** 首页站点题名，对应 `display`；在中窄屏收至较小字号（2.5rem）。
- **Headline：** 浅色文档一级标题，对应 `headline`；浅色二级标题为较小宋体（1.45rem），三级标题为功能字体（1.15rem）。
- **Section / Article Title：** 首页区段题名使用 `section-title`，最近文章的题名使用 `article-title`，便于连续扫描。
- **Body / Reading：** 通用文字使用 `body`，文档长文使用 `reading`。文档正文容器默认最大宽度（74ch），宽屏另有放宽规则；段落、标题与代码块共用容器宽度，不再单独限制段落行长。
- **Label / Poem / Mono：** 查找标签使用 `label`，诗词正文使用 `poem`，命令使用 `mono`；折叠摘要有独立 `disclosure-label`。

深色技术文章的重要标题目前继承无衬线正文栈，这是继承实现中的局部差异，不将它另立为站点展示字体。文档在窄屏使用正文大小（1rem）与行高（1.82），一级标题大小（1.75rem）；首页诗句在手机上收为正文大小（1rem）。

**The Two Voices Rule.** 书卷字体承担题名与诗词；检索、正文、命令和操作说明维持清楚的功能字体。

## Layout

首页是已存在的两列关系：左侧查找与主题入口，右侧诗笺。页面采用完整可用宽度（100%）、包含内边距的盒模型与居中上限（1160px），外侧内边距（3rem 2rem 4rem）。列宽比例（1.2fr / 1fr），间距（3.5rem）；中屏（≤996px）收为比例（1.1fr / 1fr）、间距（2rem）与页边距（2.5rem 1.5rem 3rem）；手机（≤700px）纵向排列，页边距（1.75rem 1.25rem 3rem）。这是首页构图，不是所有页面的模板。

目录索引沿用实际侧栏分类与链接顺序。分类组采用多栏流（2 栏、理想栏宽 20rem、栏距 2.5rem），组内不拆栏；在手机断点改为一栏。目录保留篇数与分类跳转，全文搜索结果集中在 `/search`，不改变分类结构。

文档在阅读纸面上展开，最终样式取消外层文章边框与圆角。桌面文章内边距（1.75rem 2rem）；中窄屏取消多层框边占位，文章内边距为（0.5rem 0）。导航高度（60px）用于目录锚点偏移。宽屏（≥1440px）内容壳最大宽度（1560px），旁栏最大宽度（320px），正文容器最大宽度（1040px）；段落与其他内容保持一致的阅读边界。

间距围绕前置 spacing 中的常用步长组合，按内容密度调整；不存在强制整站网格倍数。首页最近文章为连续行，快捷入口可换行，手机上约占两列。手机主要触控入口与按钮提供最小高度（44px）；较宽视口的文字链接保持紧凑。

技术表格保持内容宽度并限制在可用区域内，允许横向滚动；表头与代码不强行断词。移动表格保留单元格最小宽度（6rem），避免技术值被挤碎。

## Elevation & Depth

当前主要阅读路径使用平面纸张层次：正文、导航、侧栏和代码区用底色及细边线分区。文档正文与首页文章行不使用阴影。搜索结果浮层使用实色背景与细边框，选中结果使用主题底色。焦点轮廓与侧栏选中细线属于状态指示，不是装饰性光效。博客列表与正文同样不使用阴影，引用和代码通过独立实色区分。

### Shadow Vocabulary

- **搜索浮层边界：** `1px solid var(--surface-border)`，不叠加光晕或阴影。
- **选中边线：** `inset 1px 0 0 var(--ifm-color-primary)`，用于深色侧栏选中项。
- **键盘焦点：** 常规轮廓（2px、偏移 2px）；深色焦点额外保留弱强调环。输入焦点偏移收至边框，首页输入由外层统一显示轮廓。

**The Quiet Surface Rule.** 首页与博客文章行、目录和正文依靠留白、细线和底色建立层次；浮层阴影只说明叠放关系。

## Shapes

主要控件为近方形轻圆角：表格与行内代码使用 compact，输入、诗笺与常规按钮使用 standard，组合搜索框使用 search-shell，折叠块使用 disclosure。博客正文末尾标签使用 standard 圆角；列表标签是普通文字链接。正文纸面本身没有外层圆角和边框。

折页 J 以斜切上横、右上分离折角与不对称回钩构成。上横向右提起，弯钩从厚到薄收笔；折角与主体间保留 3 个 viewBox 单位的间隙，避免小尺寸粘连。轮廓由路径绘制，无外框、无纹理。导航显示大小（32px），诗词落款显示大小（30px）；通过主题图片复用浅色与深色 SVG；favicon 用系统明暗偏好选择同一标记的配色。不用字体字形、emoji 或通用图标替代。

## Components

### Buttons

查找按钮是最明确的填充操作。使用 `search-button` 与其主题、悬停变体，最小高度（44px），颜色过渡（160ms ease）。搜索结果页的重新加载按钮使用实色底、可见边框与正文色。诗词切换为轻量文字按钮，边框透明；展开全文沿用次级描边按钮。所有交互保留键盘可见焦点。

### Chips

博客正文末尾标签使用细边框、主题色文字与轻底色悬停，不发光。列表文章的标签使用可换行文字链接；标签索引以两列开放行展示真实名称和篇数，手机上变为单列。

### Cards / Containers

诗笺是有边界的独立阅读面，使用 `poetry-card`，无阴影；墨色书口承载标题与换诗操作，灰色右上折角呼应折页 J 的形状，正文居中，作者与放大的折页 J 落在底部。长诗可收起为五行并展开，保留真实诗文。首页和博客文章列表使用开放行；博客正文与页面共享阅读底色，不增加外层卡片。

### Inputs / Fields

首页、笔记目录和搜索页复用 `SiteSearchForm`，与顶部建议共用本地全文索引，检索笔记和博客的标题、正文。提交进入 `/search?q=...`，旧 `/docs/?q=...` 链接自动转到同一结果页。组合框有明文标签与提交按钮；在中窄屏隐藏图形标记以让出输入空间。

输入表面实色，占位文字使用次要文字色而不额外降低透明度。全站 caret 使用操作主色。输入键盘焦点由组合框描边。结果页展示所属路径、命中片段和高亮；空状态提供目录入口，索引加载失败显示原地重新加载按钮，加载时显示静态占位。结果页关闭星空，维持清楚的文字阅读面。

### Navigation

导航与页脚均使用实色表面、细分隔线。页脚正文链接持续显示下划线，不仅靠颜色区分。导航保留原有站点结构，文字悬停与活动状态改变文字色。文档侧栏保持原技术层级，选中项加浅底色、较重字重与左侧细线；目录索引另提供带数量的分类跳转链接。

顶部全文搜索结果使用不透明浮层，选中项有主题底色。输入框通过 aria-controls 关联建议列表；方向键选择、Enter 打开、Escape 关闭、Ctrl/Cmd+K 聚焦。“查看全部结果”和重试按钮位于列表框之外；清空按钮为 44×44px。小屏（≤576px）默认收成搜索图形宽度，输入获得焦点时扩展，并暂时让出站点题名位置；移动菜单触控按钮保持最小尺寸（44px）。导航和结果页共用按输入启动的搜索 Worker，失败请求不留在缓存中；空白输入和鼠标悬停不会下载索引。

### Not Found

404 页使用普通阅读布局、当前主题文字和背景，展示请求路径、统一搜索框、笔记目录与首页入口。不使用 Canvas、霓虹、故障闪动或持续计时器；背景星空仅在明确选定的首页与工具页显示。

### Recent Articles / Notebook Groups

最近文章以标题、摘要和底部分隔线连续排列，标题使用功能字体，摘要保留舒适行高与最大行长（78ch）。目录组标题带右侧篇数，链接按行排列，悬停改变颜色并加下划线；数据来自实际博客与实际侧栏，不用示例内容替代。

### Blog Reading / Archive

博客采用 Read 模式。列表、标签、归档共用 `BlogLayout` 的实色阅读背景与文字导航。列表最大外宽 896px，桌面左右内距 32px；有目录的文章外宽 1100px，右侧目录 224px，间距 56px。≤996px 时目录移至正文前的原生可展开块；≤600px 时左右内距 20px，文章与标签索引变为单列。

列表每篇显示完整标题、日期、文字署名、最多 120 字的自然断句摘要及真实标签。摘要优先取 description；没有有效 description 时取正文开头的段落，不渲染隐藏的正文控件。仅有真实配图时显示缩略图，加载失败移除图片；没有配图不生成字母封面。所有文章链接与 Markdown 正文保留。

博客标题桌面 2rem，手机文章标题 1.6rem；条目标题桌面 1.375rem、手机 1.2rem；摘要 0.95rem / 1.8 行高；日期与操作 0.85rem；正文 1rem / 1.9 行高。标题末尾日期保持整体换行。代码与表格横向滚动限制在内容内部，引用为实色底加 1px 左线。

归档按年份倒序，年内保留日期与完整标题。标签索引按真实篇数排序。列表分页、标签分页、文章前后篇链接继续使用 Docusaurus 路由与元数据，结构化数据和订阅正文仍由原组件生成。博客全部路由关闭星空背景。

### Disclosures / Technical Content

折叠块使用实色阅读底、轻边框与等宽摘要，打开时摘要底色转为选中色；CSS 绘制的折角指示展开状态。技术表格以表头底色和细横线建立层次，代码保持等宽字体与独立底色。Prism 在明暗模式共用语义化 `syntax-*` 变量，避免主题切换时背景与文字颜色不同步。关键字、函数、字符串与数字分色，普通文本、变量、标点与注释保持中性且清晰，不把语法颜色升级为界面操作色。

首页以诗笺展开（700ms）、折角落定（850ms）及换诗翻页（420ms）作为主要动效，正文不做入场动画。太极按钮即时切换，支持 View Transitions 的浏览器从按钮位置展开新主题（480ms），不支持时直接切换。导航下划线、快捷入口和箭头在交互时反馈；阅读页顶部 2px 进度线表示文章位置，锚点落点短暂着色。所有监听与动画在卸载时清理，星空在页面隐藏时暂停。系统检测减少动态偏好时取消翻页、折角与主题扩散，并保留直接的颜色、选中及进度反馈。

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
