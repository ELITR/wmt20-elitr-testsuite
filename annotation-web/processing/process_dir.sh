#!/usr/bin/env bash

if [ "$#" -ne 2 ]; then
    echo "Usage: process_dir.sh SRC_DIR TGT_DIR"
    exit 1
fi

for filename in $1/*.xml; do
    basefile=$(basename "$filename")
    echo $basefile
    ./gen_markables.py markables.yaml "$1/$basefile" -o "$2/$basefile"
done