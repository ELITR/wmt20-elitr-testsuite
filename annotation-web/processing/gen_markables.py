#!/usr/bin/env python3

import argparse
import yaml
import re
from collections import defaultdict
import json

parser = argparse.ArgumentParser(description='Prepare markable files')
parser.add_argument('markables', help='Path to the markables YAML file')
parser.add_argument('text', help='Path to the XML file to process')
parser.add_argument('--sensitive', type=bool, default=False,
                    help='Compare case insensitive')
parser.add_argument('-o', '--out', help='Path to the output XML file')
args = parser.parse_args()

markables = {}
distribution = defaultdict(int)


with open(args.markables) as f:
    data = yaml.load(f)
    for code in data:
        for values in data[code]:
            markables[values] = code

with open(args.text, 'r') as f:
    text = f.read()


for value, code in markables.items():
    if args.sensitive:
        distribution[code] += text.count(value)
        text = re.sub(f'(^|[^>])({value})($|[^<])', r'\1' + f'<m m="{code}">' + r'\2</m>\3', text)
    else:
        distribution[code] += text.lower().count(value.lower())
        text = re.sub(f'(^|[^>])({value})($|[^<])', r'\1' + f'<m m="{code}">' + r'\2</m>\3', text, flags=re.IGNORECASE)

if args.out:
    with open(args.out, 'w') as f:
        f.write(text)

print('Distribution:')
print(json.dumps(distribution, indent=4, sort_keys=True))