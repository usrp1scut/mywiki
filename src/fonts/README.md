# 本地字体

页面不连接 Google Fonts。`src/css/fonts.css` 引用本目录的 WOFF2，构建时生成带内容哈希的站内资源。

| 用途 | 字体 | 来源 |
| --- | --- | --- |
| 英文正文、数字、界面 | Source Sans 3 | https://fontsource.org/fonts/source-sans-3 |
| 中文正文、界面、代码中的中文 | Noto Sans SC | https://fontsource.org/fonts/noto-sans-sc |
| 诗词、首页题名、亮色文档标题 | Noto Serif SC | https://fontsource.org/fonts/noto-serif-sc |
| 英文命令、代码 | JetBrains Mono | https://fontsource.org/fonts/jetbrains-mono |

四套字体来自 `@fontsource-variable/<family>@5.3.0`。每个字体目录保留原始 SIL Open Font License；`sources.json` 记录下载地址、包完整性校验值与资源体积。字体二进制未修改。CSS 中去掉了字体家族名的 `Variable` 后缀，以沿用站点的命名。Source Sans 3 在 CSS 中使用 `SourceSans3` 别名，避免 Docusaurus 的 cssnano 因带独立数字的字体名而误删声明。

保留分发包的 `unicode-range`：浏览器只请求页面使用的字符分片，字重使用同一可变字体文件。全部字体总量不是单页下载量。英文正文及代码包括真实斜体；中文保留系统字体回退。`font-display: swap` 让文字先可读，再切换到站内字体。

维护方式：下载 `sources.json` 中的包并验证 SHA-512，复制 `index.css` 引用的 `files/*.woff2`（英文两套另加 `wght-italic.css`）；将 CSS URL 改为本地相对路径，合并到 `src/css/fonts.css`。更新时同步版本、许可证及完整性校验值。新增笔记无需重新裁剪字体。
