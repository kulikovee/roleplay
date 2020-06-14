#!/bin/bash

ssh -tt gohtml@gohtml.ru << EOF
  echo "Killing server ..."
  pkill -f server.js
  pkill -f Xvfb

  cd roleplay/
  git reset HEAD~1 --hard
  git pull origin master

  cd client/
  npm i

  cd ../server/
  npm i
  npm run build

  Xvfb :5 -screen 0 1x1x24 &
  export DISPLAY=:5

  NODE_ENV=production nohup node server.js > server.log 2> server.error.log < /dev/null &

  sleep 3

  echo "Error log:"
  cat server.error.log

  echo "Success log:"
  cat server.log

  echo "All done"
  exit
EOF
