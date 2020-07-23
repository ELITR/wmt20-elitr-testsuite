#!/usr/bin/env python3

from load import load_all


def time_single(name, data):
    times = []
    for docmodel in data.values():
        for secsent in docmodel.values():
            times.append(secsent['time'])
    times.sort()


    if len(times) <= 1:
        print(f'{name}: {len(times)} entry')
        print('Too little number of entries')
        return

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

    print(f'{name}: {len(times)} entries, {blocks} blocks')
    print(f'{spentTime/1000:5.0f}s',
          f'{spentTime/1000/60:3.0f}min ',
          f'{spentTime/1000/60/60:3.2f}h',
          )


dataAll = load_all()

for (name, data) in dataAll.items():
    time_single(name, data)
    print()
