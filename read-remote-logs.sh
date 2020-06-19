#!/bin/bash

ssh -tt gohtml@gohtml.ru << EOF
  cat roleplay/server/server.error.log &
  cat roleplay/server/server.log &
EOF
