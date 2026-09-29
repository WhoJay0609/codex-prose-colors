# 使用指南

## 启动与恢复

本工具针对 macOS 上 `/Applications/ChatGPT.app` 的桌面应用。需要 Node.js 22 或更新版本；`theme.mjs` 使用该版本提供的全局 `fetch`、`WebSocket` 和 `AbortSignal.timeout`。它通过 `open` 启动应用，以 CDP 连接本机 `127.0.0.1` 调试端口，并在助手消息中注入 `opencode-prose.css`。

首次启用时，在 Mac 上完全退出 ChatGPT，然后双击 `activate.command`。也可在终端从仓库目录运行：

```sh
node theme.mjs start
```

脚本启动应用和后台注入进程；后台进程每两秒重新应用样式，以覆盖新页面。若 `28493` 端口冲突，可通过 `CODEX_PROSE_PORT` 指定 1024–65535 之间的端口。调试服务绑定到 `127.0.0.1`。如果使用自定义端口，对 `start`、`status`、`once` 和 `stop` 的每次调用都要设置同一个 `CODEX_PROSE_PORT`，例如：

```sh
CODEX_PROSE_PORT=28500 node theme.mjs start
CODEX_PROSE_PORT=28500 node theme.mjs status
CODEX_PROSE_PORT=28500 node theme.mjs stop
```

恢复时双击 `restore.command`，或运行：

```sh
node theme.mjs stop
```

停止命令会终止后台注入进程并尝试从当前页面移除样式，但不会关闭 ChatGPT 的调试端口。要关闭调试端口（包括运行 `stop` 之后），请完全退出 ChatGPT，再正常重新打开应用；如果停止时调试页面未连接，这也会移除遗留注入样式。

其他命令：

```sh
node theme.mjs once    # 对当前页面注入一次
node theme.mjs status  # 查看调试页面
```

`activate-background.sh` 会向激活脚本提供回车，以跳过等待用户按 Return 的提示；样式注入由 `theme.mjs start` 启动的 watcher 在后台持续执行。此启动器和 `.command` 文件需要可用的 `zsh`，并使用 zsh 路径展开语法。

首次成功时，`start` 输出 JSON，其中 `status` 为 `started`，`targets` 列出连接到的页面及注入结果。`roots` 是找到并添加样式的文档根数量。若 `assistantMessages` 为 `0`，只表示该页面的普通 DOM 中没有匹配标记；当前对话可能没有助手消息、目标可能是其他页面，或消息可能在 shadow root 中，因此该数值本身不是注入失败的证据。

## 文件与调色

| 路径 | 用途 |
| --- | --- |
| `theme.mjs` | 启动应用、连接本机 CDP 并注入样式 |
| `opencode-prose.css` | 配色变量和助手消息选择器 |
| `activate.command`、`activate-background.sh` | macOS 启动器 |
| `restore.command` | 停止注入并恢复当前页面 |
| `docs/` | 截图和使用文档 |

要调整颜色，编辑 `opencode-prose.css` 中对应明暗主题的 CSS 变量；媒体查询和显式主题规则也有变量定义，需同步调整对应值。运行中的 watcher 会重新读取 CSS。实际显示还取决于应用的主题和页面结构。

## 已知限制

- 这是 macOS 桌面应用工具；脚本固定使用 `/Applications/ChatGPT.app`、`open` 和本机 CDP，不适用于浏览器中的 ChatGPT，也没有 Windows 或 Linux 桌面支持。
- 远程 Linux 上运行的 agent 不会因此获得此配色。需要在运行桌面应用的本机 Mac 上安装并启动工具。
- 注入范围依赖应用页面中的 `data-markdown-text-style="assistant-message"` 标记和 DOM 结构。应用更新可能改变这些结构或 CDP 行为。
- README 截图仅展示深色主题中的部分样式；实际文字颜色取决于主题变量和应用渲染结构。

## 贡献与验证

`node --check theme.mjs` 只检查 JavaScript 语法，不会验证 CSS 或实际注入。已在 Node.js 22.22.0 的 Linux 环境运行，退出码为 0、无输出；本轮未在 macOS 上复测启动和注入，README 截图为用户提供的运行效果。当前仓库没有声明自动化测试命令。提交问题时请附上 macOS 版本、ChatGPT 版本、Node.js 版本、运行的命令以及可复现步骤。仓库目前没有声明许可证。

## 故障排查

- 启动器提示先退出 ChatGPT：完全退出应用后重试，不能只关闭窗口。
- 提示找不到 Node.js：安装 Node.js 22 或更新版本，并确认 `node` 可从终端运行。
- 提示未打开 CDP endpoint：确认 ChatGPT 已退出后重新运行 `node theme.mjs start`；若问题持续，检查端口 `28493` 是否被占用，或设置 `CODEX_PROSE_PORT` 后重试。
- 命令成功但回复没有配色：查看 `node theme.mjs once` 输出中的 `targets` 和 `roots`。`assistantMessages: 0` 可能表示当前页面没有已显示的助手消息、连到了其他页面，或消息位于 shadow root；单凭此数值不能判断失败。确认目标页面后再检查配色，必要时正常重启 ChatGPT。
