#!/bin/bash

echo "Copy server to the server ..."
npm run build-production
scp dist/server.js gohtml@gohtml.ru:roleplay-server/server.js

ssh -tt gohtml@gohtml.ru << EOF
  echo "Killing server ..."
  pkill -f server.js

  echo "Running server ..."
  cd roleplay-server
  nohup node server.js > server.log 2> server.error.log < /dev/null &

  sleep 1

  echo "Error log:"
  cat server.error.log

  echo "Success log:"
  cat server.log

  tail -f server.error.log &
  tail -f server.log &
EOF
