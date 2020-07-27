#!/usr/bin/env bash

echo -e "Preparing content:"
./src/preparation/prepare_content.py  ./experiment.yaml ./data --out-content ../backend/logs/content.json
mkdir -p ../backend/logs/p1/
mkdir -p ../backend/logs/p2/

# echo -e "\nPreparing user queue P1:"
# ./src/preparation/prepare_queue_p1.py ./experiment.yaml ./data --out-queue   ../backend/logs/p1/queue_user.json

echo -e "\nPreparing user queue P2:"
./src/preparation/prepare_queue_p2.py ./experiment.yaml ./data --out-queue   ../backend/logs/p2/queue_user.json