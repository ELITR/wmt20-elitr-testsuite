#!/usr/bin/env bash

./src/prepare_content.py  ./experiment.yaml ./example_docs --out-content ../backend/logs/content.json
./src/prepare_queue_p1.py ./experiment.yaml ./example_docs --out-queue   ../backend/logs/p1/queue_user.json
./src/prepare_queue_p2.py ./experiment.yaml ./example_docs --out-queue   ../backend/logs/p2/queue_user.json
