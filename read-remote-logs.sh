#!/bin/bash

ssh -tt gohtml@gohtml.ru << EOF
  tail -f roleplay/server/server.error.log &
  tail -f roleplay/server/server.log &
EOF
