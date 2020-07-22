WMT sgm processing:

```
for file in ./*.sgm; do
	echo $file 
	tail -n +14973 "$file" | head -n 13 | sed -E 's/<seg id="[0-9]*">//g; s/<\/seg>//g' > tmp
	mv tmp "$file"
done
```