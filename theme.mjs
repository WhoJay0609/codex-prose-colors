import { readFile, writeFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';

const dir = new URL('.', import.meta.url);
const cssPath = new URL('opencode-prose.css', dir);
const pidPath = new URL('watcher.pid', dir);
const logPath = new URL('watcher.log', dir);
const app = '/Applications/ChatGPT.app';
const port = Number(process.env.CODEX_PROSE_PORT || 28493);
const endpoint = `http://127.0.0.1:${port}`;
const styleId = 'codex-opencode-prose-colors';
const command = process.argv[2] || 'status';

if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid port');

async function targets() {
  const response = await fetch(`${endpoint}/json/list`, { signal: AbortSignal.timeout(1500) });
  if (!response.ok) throw new Error(`CDP returned HTTP ${response.status}`);
  return (await response.json()).filter(t => t.webSocketDebuggerUrl && t.type === 'page');
}

function cdp(url, method, params) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    const timer = setTimeout(() => { socket.close(); reject(new Error('CDP timeout')); }, 4000);
    socket.onopen = () => socket.send(JSON.stringify({ id: 1, method, params }));
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id !== 1) return;
      clearTimeout(timer);
      socket.close();
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    };
    socket.onerror = () => { clearTimeout(timer); reject(new Error('CDP connection failed')); };
  });
}

async function change(mode) {
  const css = mode === 'apply' ? await readFile(cssPath, 'utf8') : '';
  const expression = `(() => {
    const id = ${JSON.stringify(styleId)};
    const css = ${JSON.stringify(css)};
    let roots = 0;
    const visit = root => {
      if (!root) return;
      const old = root.querySelector?.('#' + id);
      if (${JSON.stringify(mode)} === 'remove') old?.remove();
      else {
        const style = old || document.createElement('style');
        style.id = id;
        if (style.textContent !== css) style.textContent = css;
        if (!style.isConnected) (root.head || root).append(style);
        roots++;
      }
      for (const el of root.querySelectorAll?.('*') || []) if (el.shadowRoot) visit(el.shadowRoot);
    };
    visit(document);
    return {roots, assistantMessages: document.querySelectorAll('[data-markdown-text-style="assistant-message"]').length};
  })()`;
  const found = await targets();
  if (!found.length) throw new Error('No CDP page targets');
  const results = [];
  for (const target of found) {
    const result = await cdp(target.webSocketDebuggerUrl, 'Runtime.evaluate', {
      expression, returnByValue: true, awaitPromise: false
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    results.push({ title: target.title, url: target.url, ...result.result.value });
  }
  return results;
}

async function waitForEndpoint() {
  for (let attempt = 0; attempt < 30; attempt++) {
    try { return await targets(); } catch { await new Promise(r => setTimeout(r, 1000)); }
  }
  throw new Error('Codex did not open a CDP endpoint. Quit ChatGPT completely, then run start again.');
}

if (command === 'start') {
  if (!existsSync(app)) throw new Error(`Missing ${app}`);
  try { await targets(); }
  catch {
    const result = spawnSync('open', ['-a', app, '--args',
      '--remote-debugging-address=127.0.0.1', `--remote-debugging-port=${port}`], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr || 'Could not launch ChatGPT');
    await waitForEndpoint();
  }
  if (existsSync(pidPath)) {
    const old = Number((await readFile(pidPath, 'utf8')).trim());
    if (old && old !== process.pid) { try { process.kill(old, 'SIGTERM'); } catch {} }
  }
  const log = await import('node:fs').then(fs => fs.openSync(logPath, 'a'));
  const child = spawn(process.execPath, [new URL(import.meta.url).pathname, 'watch'], {
    detached: true, stdio: ['ignore', log, log], env: process.env
  });
  child.unref();
  await writeFile(pidPath, `${child.pid}\n`);
  console.log(JSON.stringify({ status: 'started', port, watcherPid: child.pid, targets: await change('apply') }));
} else if (command === 'watch') {
  let missing = 0;
  while (missing < 300) {
    try { await change('apply'); missing = 0; }
    catch (error) { missing++; if (missing === 1) console.error(error.message); }
    await new Promise(r => setTimeout(r, 2000));
  }
} else if (command === 'stop') {
  if (existsSync(pidPath)) {
    const pid = Number((await readFile(pidPath, 'utf8')).trim());
    if (pid) { try { process.kill(pid, 'SIGTERM'); } catch {} }
    await unlink(pidPath);
  }
  try { console.log(JSON.stringify({ status: 'removed', targets: await change('remove') })); }
  catch { console.log(JSON.stringify({ status: 'watcher stopped; restart ChatGPT normally to remove CSS' })); }
} else if (command === 'once') {
  console.log(JSON.stringify({ status: 'applied', targets: await change('apply') }));
} else if (command === 'status') {
  console.log(JSON.stringify({ port, targets: await targets() }));
} else {
  throw new Error('Usage: node theme.mjs start|stop|once|status');
}
