# Codex prose colors

给 macOS ChatGPT/Codex 桌面应用中的助手 Markdown 回复添加配色。样式定义在 `opencode-prose.css`，通过本机 Chrome DevTools Protocol 注入；不修改应用安装文件。

## 运行

需要 `/Applications/ChatGPT.app` 和 Node.js 22 或更新版本。先完全退出 ChatGPT，再双击 `activate.command`。脚本会启动应用并持续为新页面注入样式。也可以执行 `activate-background.sh`，避免等待终端输入。

双击 `restore.command` 可停止后台进程并移除当前页面的样式。若页面未连接调试端口，正常重启 ChatGPT 即可恢复原样。

命令行用法：

```sh
node theme.mjs start   # 启动应用和后台注入
node theme.mjs once    # 对当前页面注入一次
node theme.mjs status  # 查看调试页面
node theme.mjs stop    # 停止并移除样式
```

默认使用本机端口 `28493`；如端口冲突，可设置 `CODEX_PROSE_PORT`。调试服务只绑定到 `127.0.0.1`。

## 调整颜色

编辑 `opencode-prose.css` 中的 CSS 变量即可。后台进程每两秒重新应用样式。样式只作用于带 `data-markdown-text-style="assistant-message"` 的助手消息；具体元素结构可能随桌面应用更新而变化。
