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

## Markdown 配色效果

![深色主题下的 Markdown 配色示例](docs/markdown-colors.png)

在 Codex 桌面应用的助手回复中，普通正文保持正文色；标题为紫色（一级标题带下划线），**加粗文字为橙色**，*斜体为金色*，[链接为蓝色](https://example.com)，`行内代码为绿色`。无序列表标记为橙粉色，有序列表编号为蓝色；引用文字为灰色、边线为金色，分隔线为灰色。代码块中的文字还可能受应用语法高亮影响。截图展示的是深色主题；浅色主题使用另一组色值。这里的“高亮”指文字颜色，不是背景色。GitHub 上的 README 由 GitHub 自己的样式渲染，需在启用本工具的桌面应用中查看配色效果。

截图使用的 Markdown 示例：

````md
# 配色展示

这是一段普通正文：**关键结论用橙色加粗**，*轻度强调用金色斜体*；[链接显示为蓝色](https://github.com/WhoJay0609/codex-prose-colors)，`行内代码显示为绿色`。

> 引用文字显示为灰色，左侧有金色边线。

- 无序列表的圆点是橙粉色。

1. 有序列表的编号是蓝色。

```text
代码块中的文字使用正文色。
```

---

分隔线使用灰色；标题颜色、文字颜色和其他色值会随明暗主题变化。
````

如果希望 Codex 主动用这些格式区分内容，可在自己的 `~/.codex/AGENTS.md` 中加入：

```md
## Markdown 配色

回复时根据内容自然使用 Markdown：标题用于分节，**加粗**用于关键结论或变动片段，*斜体*用于轻度强调，行内代码用于文件名、函数名和具体值，列表用于多步骤内容，链接用于引用来源。颜色由本地样式决定；不要为了上色而滥用格式。

修改论文或报告时，如需展示修改前后，分别列出原文和修改后文本，只将修改后的新增或改动片段加粗。例如：
修改前：该方法提高了性能。
修改后：该方法**在三个公开数据集上降低了平均延迟**。

这些 Markdown 标记只用于回复展示，不要为了配色写进论文正文、LaTeX 源文件或代码文件。
```

## 调整颜色

编辑 `opencode-prose.css` 中的 CSS 变量即可。后台进程每两秒重新应用样式。样式只作用于带 `data-markdown-text-style="assistant-message"` 的助手消息；具体元素结构可能随桌面应用更新而变化。
