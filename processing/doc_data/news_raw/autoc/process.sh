#!/usr/bin/env bash

for file in ./*.sgm; do
	echo $file 
	tail -n +1916 "$file" | head -n 22 | sed -e "15,18d" | sed -E 's/<seg id="[0-9]*">//g; s/<\/seg>//g' > tmp
	mv tmp "$file"
done
