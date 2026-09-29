# Codex prose colors

**简体中文** | [English](README.en.md)

为 **macOS 版 ChatGPT/Codex 桌面应用**中的助手 Markdown 回复添加文字配色。通过本机 Chrome DevTools Protocol 注入 CSS，不修改应用安装文件。即使 Codex agent 运行在远程 Linux 主机上，样式也只会出现在安装并运行此工具的本机 Mac 桌面应用里。

## 首次使用

需要 macOS、`/Applications/ChatGPT.app` 和 Node.js 22 或更新版本。在 Mac 上完全退出 ChatGPT，然后运行：

```sh
git clone https://github.com/WhoJay0609/codex-prose-colors.git
cd codex-prose-colors
node theme.mjs start
```

启动成功时，命令输出含 `"status":"started"` 的 JSON；打开有助手回复的对话查看效果。这是 [脚本定义的行为](theme.mjs)，不是本轮 macOS 实测记录。也可双击 `activate.command` 启动，运行 `node theme.mjs stop` 或双击 `restore.command` 停止并恢复样式。完整步骤和故障排查见[使用指南](docs/usage.md)。

已测：Node.js 22.22.0（Linux）运行 `node --check theme.mjs`，退出码为 0、无输出。下方截图展示用户提供的运行效果；本轮未在 macOS 上复测启动和注入。

代码入口：[theme.mjs](theme.mjs)；配色：[opencode-prose.css](opencode-prose.css)；回复格式建议：[docs/agents-snippet.md](docs/agents-snippet.md)。

![深色主题下的 Markdown 配色示例](docs/markdown-colors.png)

在 Codex 桌面应用的助手回复中，普通正文保持正文色；标题为紫色（一级标题带下划线），**加粗文字为橙色**，*斜体为金色*，[链接为蓝色](https://example.com)，`行内代码为绿色`。无序列表标记为橙粉色，有序列表编号为蓝色；引用文字为灰色、边线为金色，分隔线为灰色。代码块中的文字还可能受应用语法高亮影响。截图展示的是深色主题；浅色主题使用另一组色值。这里的“高亮”指文字颜色，不是背景色。GitHub 上的 README 由 GitHub 自己的样式渲染，需在启用本工具的桌面应用中查看配色效果。

<details>
<summary>展开可复制的 Markdown 配色示例</summary>

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

</details>

## 修改前后示例

下面使用原创、虚构的英文图书馆预约说明演示文本修改：未修改的上下文保持灰色，修改后的关键片段通过 Markdown 加粗显示为橙色文字。示例仅用于配色展示，不代表真实系统的实现或测试结果。

![英文文本修改前后对比：修改后的关键片段显示为橙色](docs/revision-example.png)

希望回复按语义使用这些 Markdown 样式时，可将[建议片段](docs/agents-snippet.md)复制到 `~/.codex/AGENTS.md`。该片段只影响回复格式，不会安装或启用本工具。
