#!/bin/zsh
set -e
DIR=${0:A:h}
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if pgrep -f '^/Applications/ChatGPT.app/Contents/MacOS/ChatGPT($| )' >/dev/null; then
  echo 'Quit ChatGPT completely and run this script again.'
  exit 1
fi

node "$DIR/theme.mjs" start
echo 'OpenCode prose colors are active. Press Return to close this Terminal window.'
read
