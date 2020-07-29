#!/usr/bin/env python3

from load import load_all
import numpy as np
import matplotlib.pyplot as plt
import argparse

parser = argparse.ArgumentParser(description='Computes time.')
parser.add_argument('--no-graphs', action='store_true', help='Skip displaying graphs', default=False)
args = parser.parse_known_args()[0]

def displayTime(spentTime):
    return f'{spentTime/1000:6.0f}s {spentTime/1000/60:3.0f}min {spentTime/1000/60/60:3.2f}h'
          
def average_models(rating):
    out = [(float(x['fluency'])*float(x['adequacy'])) for x in rating.values()]
    return np.average(out)

totalFaulty = 0
totalEntries = 0

def time_single(name, data):
    global totalEntries, totalFaulty
    times = []
    ratingMult = []
    ratingFluency = []
    ratingAdequacy = []
    ratingConflict = []
    for docmodel in data.values():
        for secsent in docmodel.values():
            times.append(secsent['time'])
            del secsent['time']
            # try:
            #     ratingMult.append(np.average([(float(x['fluency'])*float(x['adequacy'])) for x in secsent.values()]))
            #     ratingFluency.append(np.average([float(x['fluency']) for x in secsent.values()]))
            #     ratingAdequacy.append(np.average([float(x['adequacy']) for x in secsent.values()]))
            #     ratingConflict.append(np.average([1-1*x['conflicting'] for x in secsent.values()]))
            # except Exception:
            #     # print(secsent)
            #     totalFaulty += 1
    # times.sort()

    totalEntries += len(times)

    if len(times) <= 1:
        print(f'{name}: {len(times)} entries')
        print('Too little number of entries')
        return 0

    spentTime = 0
    blockBegin = times[0]
    blocks = 0
    blockTimes = []
    blockStop = []

    for index, time in enumerate(times[1:], start=1):
        diff = time - times[index-1]
        # 30 minutes for one view
        if diff > 30*60*1000 or index == len(times)-1:
            blockTimes.append(times[index-1] - blockBegin)
            spentTime += times[index-1] - blockBegin
            blockBegin = time
            blocks += 1
            blockStop.append(index-1)

    print(f'{name}: {len(times)} entries, {blocks} blocks')
    print(f'Block avg: {displayTime(np.average(blockTimes))}')
    print(f'Entry avg: {displayTime(np.average(spentTime//len(times)))}')
    print(f'Total:     {displayTime(spentTime)}')

    if not args.no_graphs:
        # plt.plot(ratingMult,     label='Fluency*Adequacy')
        # plt.plot(ratingFluency,  label='Fluency')
        # plt.plot(ratingAdequacy, label='Adequacy')
        # plt.plot(ratingConflict, label='Non-Conflicting')
        # # plt.plot(blockStop, [0.5]*len(blockStop), 'ro')
        # plt.vlines(blockStop, 0.1, 1.1, linestyles='dashed', label='Block separator')
        # plt.ylim(0,1.2)
        # plt.legend()
        # plt.show()

    return spentTime

dataAll = load_all()
total = 0
for (name, data) in dataAll.items():
    total += time_single(name, data)
    print()

print(f'Total:')
print(f'Time:     {displayTime(total)}')
print(f'Entries:  {totalEntries}')
print(f'Faulty:   {totalFaulty}')