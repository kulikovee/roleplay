#!/bin/bash

ssh -tt gohtml@gohtml.ru << EOF
  echo "Updating repository ..."
  cd ./roleplay/
  git reset HEAD~1 --hard
  git pull origin master

  echo "Installing dependencies ..."
  cd client/
  npm i
  npm run build

  cd ../server/
  npm i
  npm run build

  echo "Killing server ..."
  pkill -f server.js

  sleep 1

  NODE_ENV=production nohup node server.js > server.log 2> server.error.log < /dev/null &

  sleep 3

  echo "Error log:"
  cat server.error.log

  echo "Success log:"
  cat server.log

  echo "All done"
  exit
EOF
