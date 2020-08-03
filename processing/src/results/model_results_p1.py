#!/usr/bin/env python3

from load import load_all
import numpy as np
from utils import nicename, modelBLEU

data = load_all()
resultsDoc = {}
models = set()

for user in data.values():
    for (docName, document) in user.items():
        for line in document.values():
            for (name, model) in line.items():
                if name == 'time':
                    continue
                models.add(name)
                if 'fluency' in model and 'adequacy' in model:
                    valTuple = (float(model['fluency']), float(model['adequacy']), float(model['fluency'])*float(model['adequacy']))
                    resultsDoc.setdefault(docName, {}).setdefault(name, []).append(valTuple)
            
avg_get = lambda arr, index: np.average([x[index] for x in arr])
std_get = lambda arr, index: np.std([x[index] for x in arr])
avg_all = lambda arr: (avg_get(arr, 0), avg_get(arr, 1), avg_get(arr, 2), std_get(arr, 2))
avg_all_list = lambda arr: (avg_get(arr, 0), avg_get(arr, 1), avg_get(arr, 2), avg_get(arr, 3))

def compute_results(docs, printOut=True):
    resultsAll = {}
    for doc in docs:
        results = { k:avg_all(arr) for (k,arr) in doc.items()}
        for k,v in results.items():
            resultsAll.setdefault(k, []).append(v)            
    
    resultsAll = { k:avg_all_list(arr) for (k,arr) in resultsAll.items()}

    if printOut:
        print(f'{"model":<30}{"fluency":<10}{"adequacy":<10}{"multiply (sort)":<20}{"deviation":<10}')
        for name,result in sorted(resultsAll.items(), key=lambda x: x[1][2], reverse=True):
            print(f'{name:<30}{result[0]:7.2f}{result[1]:11.2f}{result[2]:17.2f}{result[3]:13.2f}')

    return resultsAll


print('Total:')
resultsComputed = compute_results(resultsDoc.values())

models = sorted(models, key=lambda model: resultsComputed[model][2], reverse=True)

print('\n{')
for model in models:
    multT = resultsComputed[model][2]
    print(f"'{model}': {multT},")
print('}')

print('\nNews:')
resultsNews = compute_results([resultsDoc['autoc'], resultsDoc['euroe']])

print('\nAudit:')
resultsAudit = compute_results([resultsDoc['brouke'], resultsDoc['broukc']])

print('\nLease:')
resultsLease = compute_results([resultsDoc['kufrc'], resultsDoc['kufre']])
 

print('\nDomain correlation:')
resultsNews =  [resultsNews[model][2] for model in models]
resultsAudit = [resultsAudit[model][2] for model in models]
resultsLease = [resultsLease[model][2] for model in models]

print(f'Audit-News:  {np.corrcoef(resultsAudit, resultsNews)[0][1]:.2f}')
print(f'Audit-Lease: {np.corrcoef(resultsAudit, resultsLease)[0][1]:.2f}')
print(f'News-Lease:  {np.corrcoef(resultsNews,  resultsLease)[0][1]:.2f}')


print('\nBLEU correlation')

BLEUs = []
ratings = []
for model, bleu in modelBLEU.items():
    multT = compute_results(resultsDoc.values(), False)[model][2]
    BLEUs.append(bleu)
    ratings.append(multT)
print(f'BLEU-rating correlation: {np.corrcoef(BLEUs, ratings)[0][1]:.2f}')

print('\n%%%'*4)

for model in models:
    multT = compute_results(resultsDoc.values(), False)[model][2]
    multN = compute_results([resultsDoc['autoc'], resultsDoc['euroe']], False)[model][2]
    multA = compute_results([resultsDoc['brouke'], resultsDoc['broukc']], False)[model][2]
    multL = compute_results([resultsDoc['kufrc'], resultsDoc['kufre']], False)[model][2]
    stdT =  compute_results(resultsDoc.values(), False)[model][3]
    print(nicename(model), '\\hspace{-0.2cm}', end='')
    print(' & ', '\\blocksimple{', f'{(multT-0.4)/(1-0.4):.3f}', '}', sep='', end='')
    print(' & ', '\\blocksimple{', f'{(multN-0.4)/(1-0.4):.3f}', '}', sep='', end='')
    print(' & ', '\\blocksimple{', f'{(multA-0.4)/(1-0.4):.3f}', '}', sep='', end='')
    print(' & ', '\\blocksimple{', f'{(multL-0.4)/(1-0.4):.3f}', '}', sep='', end='')
    print(' & ', f'{stdT:.2f}', sep='', end='\\\\\n')

print('\n%%%'*4)