# Jacob's Wiki

### 环境要求

Node.js 24 LTS（当前固定为 `24.22.1`，见 `.nvmrc`）和 Yarn Classic 1.x。
本地与 GitHub Actions 使用同一份 `.nvmrc`；`package.json` 限定 Node.js 为 `^24.22.1`。

已安装 nvm 时，在项目目录执行：

```bash
nvm install
nvm use
```

### init

 `yarn install --frozen-lockfile`

 ### debug

 `yarn start`

 ### build

 `yarn build`

### 首页技能树

首页技能树从 Docusaurus 编译后的知识库元数据读取笔记标题和实际链接，在每次构建时更新篇数。
六条技能分支与文档路径的对应关系维护在 `plugins/skill-tree/data.js`；一篇笔记只计入一个技能，草稿、未列出的文档和目录页不参与统计。
当前展示的是笔记覆盖范围，篇数不代表熟练度或认证等级。认证入口复用知识库首页已有记录。

`src/components/SkillTree` 负责交互与样式：桌面展示完整分支，手机切换单条分支，选中技能后可查看并展开笔记。
延续站点的字体、明暗主题与语义色，不引入额外依赖。新增分类时修改路径映射；已有分类下新增笔记后重新构建即可更新。

```bash
npm run test:skills
npm run build
```

### 原生工具箱

导航和首页的「工具箱」进入 `/tools`，目前提供 20 个工具入口：

- 格式与编码：JSON、Base64、URL、YAML / JSON、文本 / JSON 对比、二维码生成与图片识别。
- 时间与计划：时间戳、Cron 解析与周期生成。
- 生成与校验：文本与文件哈希、UUID、密码、正则、JWT 解码、PEM / DER 证书解析。
- 运维配置：Docker run → Compose、chmod / umask。
- 网络：IPv4 子网、IPv4 / IPv6 范围与 CIDR、DNS 查询、公网 IP 查询。

`/tools#cron` 等链接可以直接打开指定工具，输入内容不进入网址或浏览器存储，切换工具时在当前页面内保留输入。
刷新或离开页面后清空。收藏仅保存工具 ID（`wiki-tool-favorites`）；禁用存储时降级为本页收藏。
文本输入支持导入 UTF-8 文件（最多 2 MB），结果支持复制与下载。文件哈希在 Worker 中分块计算并支持取消。
支持明暗主题和手机布局；Docker、Kubernetes、Linux 权限、DNS、Nginx、子网笔记提供相关工具入口。

除 DNS / 公网 IP 查询外，处理都在浏览器本地完成。联网工具不会自动发送请求：
DNS 由用户选择 [Cloudflare](https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/dns-json/) 或
[Google Public DNS](https://developers.google.com/speed/public-dns/docs/doh/json)，出口 IP 使用 [ipify](https://www.ipify.org/)。
这些公开 API 无需密钥，受网络与服务限流影响；失败会显示提示，DNS 可切换服务。
JWT 只解码、不验证签名；证书只解析本地内容、不验证信任链或吊销状态；Docker 只生成配置，不执行命令，遇到不支持的参数会报错。

实现位于 `src/components/Toolbox`：`catalog.js` 管理工具名称、分组与关键词，`panels/` 按需加载界面，
`logic.mjs` 保存可独立测试的转换与计算逻辑。JSON 格式化保留数字原文，避免大整数精度丢失；
正则在 Web Worker 中运行，超时会终止；密码和 UUID 使用安全随机数。
Cron 使用 `cron-parser`，哈希使用 `hash-wasm`；YAML、diff、X.509、IP 与二维码依赖均在 Yarn 锁文件中固定版本。

工具箱是本仓库的 React 源码，不再嵌入 IT-Tools，也不再从上游拉取或打包静态应用。
GitHub Actions 运行工具测试后，随 wiki 一次构建并通过原有流程发布 OSS，无需后端或额外 Secrets。

```bash
yarn test:tools
yarn build
yarn serve
```

### 开发运维速查笔记

知识库增加 [开发运维速查目录](docs/00-开发运维速查.md)，将 IT-Tools 的 26 个备忘录主题整理为中文笔记，按现有技术分类收录并加入站内搜索。
内容采用常用操作摘译与补充，保留上游固定版本、来源和修改日期；不复制工具应用或编译产物，也不自动覆盖同步上游。

各译文及改编页在 front matter 和页尾标明 GPL 3.0，许可全文位于 `static/licenses/it-tools-notes-GPL-3.0.txt`。
这些页面的许可与站点独立代码、已有笔记分开标注。更新译文时同时更新来源版本与日期，并运行 `yarn build` 检查 MDX、链接和搜索索引。

### 生活指南自动更新

`.github/workflows/sync-life-guide.yml` 每天北京时间 07:23 检查
`eternity4719/HowToLiveBetter` 的默认分支，也支持在 Actions 页面手动运行。
没有相关内容变化时跳过构建和部署；有变化时只同步 `book/*.md`、许可证与本站生成的目录和来源记录，
通过哈希、正文完整性、搜索测试、构建和站内链接检查后提交到 `main`，再调用现有 OSS 发布流程。
运行于 GitHub，无需保持本机或 Codex 开启，也不需要新增 PAT。

```bash
# 只检查和验证上游更新，不改 wiki 文件
python3 scripts/sync-life-guide.py --source-dir /tmp/howtolivebetter --dry-run
# 同步并检查生成结果（这个命令不提交、不推送）
python3 scripts/sync-life-guide.py --source-dir /tmp/howtolivebetter
python3 -m unittest discover -s tests -p 'test_life_sync.py'
yarn build
node scripts/check-life-guide.mjs
```

- 目录、收录说明由 `scripts/life-guide/*.md.in` 生成；修改说明应编辑模板后运行导入脚本，避免下次同步覆盖。
- `scripts/life-guide/policy.json` 固定已核对的 CC BY 4.0、MIT 和 README 许可声明哈希；许可变化需人工核对后更新策略，不能直接接受新哈希。
- 新增连续编号的章节和条目可自动处理。章节移除/改名、无效引用、可识别广告、可执行标记或不支持的格式会使同步失败，校验失败不会提交或部署。
- 普通 PR 仅运行检查，只有当前 `main` 的构建可以发布；同步与普通发布共用发布并发锁，过时提交跳过上传。并发修改 main 时同步推送会被拒绝，不强推。
- 查看 [Sync life guide](https://github.com/usrp1scut/mywiki/actions/workflows/sync-life-guide.yml) 的运行结果。检查失败修正后重跑；上传失败可重跑失败任务，或手动运行 [Node.js CI](https://github.com/usrp1scut/mywiki/actions/workflows/node.js.yml) 发布当前 main。
- [GitHub 调度可能延迟，公开仓库长时间没有活动时可能停用定时任务](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)；可在 Actions 页面重新启用。提交和页面均记录实际导入日期。

自动同步显式[复用发布工作流](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)，
因为 [GITHUB_TOKEN 推送不会触发另一个 push 工作流](https://docs.github.com/en/actions/concepts/security/github_token)。
正文只作为不可信 Markdown 数据处理，不复制上游广告入口，也不执行其脚本或 skill。
