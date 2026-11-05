# Jacob's Wiki

<!-- impeccable:product-schema 1 -->

## Platform

Web，兼顾桌面和手机浏览器。

## Product Purpose

Jacob 的个人 wiki，用于查阅运维知识、技术实践和生活指南。
原生工具箱支持日常开发与运维中的格式化、转换、校验、生成和计算。

## Operating Context

现有 Docusaurus / React 网站，通过 GitHub Actions 构建静态站点并上传阿里云 OSS。
保留现有导航、知识库、生活指南、资讯、博客和性格测试入口。

## Capabilities and Constraints

用户确认首批原生工具：JSON、Base64、URL 编解码、时间戳、哈希、UUID、密码生成、正则、Cron、子网计算。
工具源码在本仓库维护，随 wiki 构建；不嵌入上游 IT-Tools，不拉取其源码或预编译站点。
第二批增加 YAML / JSON、文本 / JSON 对比、JWT 解析、Docker → Compose、chmod / umask、证书解析、IPv4 / IPv6 范围工具、二维码、DNS 与公网 IP 查询。
同时扩展文件哈希、Cron 可视化生成、收藏、文本文件导入、结果下载，以及知识库双向关联入口。
工具不依赖自建后端。DNS 查询按用户点击调用 Cloudflare / Google Public DNS，公网 IP 按用户点击调用 ipify；页面明确区分本地与联网工具。
收藏只保存工具 ID；输入、文件、令牌、证书与结果不写入浏览器持久存储。
公共网站的既有视觉系统保持不变，具体规范见 DESIGN.md。

## Open Decisions

本批范围已确定，后续新增工具再按实际使用需求选择。
