#!/bin/bash
set -euo pipefail

# Deploys the headless server to a Node 12.8 host.
#
# esbuild needs Node >=18, so the bundle is built HERE (on a modern Node) and the
# single artifact is shipped to prod, which only ever runs `node` (v12). three and
# the GLTFLoader addon are bundled into the artifact; prod just needs the external
# runtime deps (ws, mock-browser). See build-node12.js / src/node12-globals.js.
#
# The browser client (hosted separately on GitHub Pages) is no longer built here —
# the server only reads the git-tracked asset sources under client/src/assets, and
# its bundler wouldn't run on Node 12 anyway.

SERVER_DIR="$(cd "$(dirname "$0")" && pwd)"
REMOTE=gohtml@gohtml.ru
REMOTE_DIR=roleplay/server

echo "Building Node 12 bundle locally ($(node -v)) ..."
( cd "$SERVER_DIR" && npm run build:node12 )

echo "Uploading bundle to $REMOTE ..."
ssh "$REMOTE" "mkdir -p $REMOTE_DIR/dist"
# Upload to a staging name so a half-transferred file can never replace a good one.
scp "$SERVER_DIR/dist/server.node12.cjs" "$REMOTE:$REMOTE_DIR/dist/server.node12.cjs.new"

ssh -tt "$REMOTE" << 'EOF'
  echo "Updating repository (asset sources + runtime deps) ..."
  cd ./roleplay/
  git reset HEAD~1 --hard
  GIT_SSH_COMMAND='ssh -o CheckHostIP=no' git pull origin master

  cd server/
  # npm 6 (ships with Node 12) doesn't support --omit=dev; --production skips
  # devDependencies, i.e. esbuild, which cannot run here anyway.
  npm i --production

  echo "Swapping in fresh bundle ..."
  mv -f dist/server.node12.cjs.new dist/server.node12.cjs

  echo "Killing server ..."
  # Kill the node12 bundle and any lingering legacy `node server.js` process so the
  # new one can bind its port. (prod:node12 runs plain ws on 127.0.0.1:1338; nginx
  # terminates wss on the public :1337 and proxies in.)
  pkill -f server.node12.cjs || true
  pkill -f 'server\.js' || true

  sleep 1

  echo "Starting server on $(node -v) ..."
  nohup npm run prod:node12 > server.log 2> server.error.log < /dev/null &

  sleep 3

  echo "Error log:"
  cat server.error.log

  echo "Success log:"
  cat server.log

  echo "All done"
  exit
EOF
