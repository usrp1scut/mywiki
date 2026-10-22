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
