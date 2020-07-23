#!/usr/bin/env python3

from load import load_single

data = load_single()

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
    # 20 minutes for one view
    if diff > 20*60*1000 or index == len(times)-1:
        spentTime += times[index-1] - blockBegin
        blockBegin = time
        blocks += 1

print('Blocks:', blocks)
print('Time spent: ', spentTime//1000, 's', sep='')