#!/bin/bash

ssh -tt gohtml@gohtml.ru << EOF
  echo "Killing server ..."
  pkill -f server.js

  cd roleplay/client/
  # npm i

  cd ../server/
  # npm i
  # npm run build

  nohup node server.js > server.log 2> server.error.log < /dev/null &

  sleep 3

  echo "Error log:"
  cat server.error.log

  echo "Success log:"
  cat server.log

  echo "All done"
  exit
EOF
