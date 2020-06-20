#!/bin/bash

ssh -tt gohtml@gohtml.ru << EOF
  echo "~~~~ Error log: ~~~~"
  cat roleplay/server/server.error.log
  echo "\n\n~~~~ Success log: ~~~~~"
  cat roleplay/server/server.log
  exit
EOF
