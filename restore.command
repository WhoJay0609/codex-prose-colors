#!/bin/zsh
set -e
DIR=${0:A:h}
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
node "$DIR/theme.mjs" stop
echo 'Original prose colors restored. Press Return to close this Terminal window.'
read
