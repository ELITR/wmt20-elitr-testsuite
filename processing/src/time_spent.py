#!/usr/bin/env python3

import json
import argparse

parser = argparse.ArgumentParser(description='Measure the time annotator spent on this experiment. Automatically detects P1 and P2.')
parser.add_argument('rating_file', help='Path to the logged user JSONfile')
args = parser.parse_args()

data = json.load(open(args.rating_file, 'r'))

times = []
for docmodel in data.values():
    for secsent in docmodel.values():
        times.append(secsent['time'])
times.sort()

print('Entries:', len(times))

if len(times) <= 1:
    print('Too little number of entries')
    exit(0)


spentTime = 0
blockBegin = times[0]
blocks = 0

for index, time in enumerate(times[1:], start=1):
    diff = time - times[index-1]
    # 5 minutes for one view
    if diff > 5*60*1000 or index == len(times)-1:
        spentTime += times[index-1] - blockBegin
        blockBegin = time
        blocks += 1

print('Blocks:', blocks)
print('Time spent: ', spentTime//1000, 's', sep='')