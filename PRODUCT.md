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
工具在浏览器内运行，不依赖自建后端。未来需要联网的工具可使用公开 API；本批不需要。
公共网站的既有视觉系统保持不变，具体规范见 DESIGN.md。

## Open Decisions

后续工具的扩展范围尚未确定。
