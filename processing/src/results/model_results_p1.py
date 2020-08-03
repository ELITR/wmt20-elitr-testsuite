#!/usr/bin/env python3

from load import load_all
import numpy as np
from utils import nicename 

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

def show_results(docs, printOut=True):
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
resultsComputed = show_results(resultsDoc.values())

models = sorted(models, key=lambda model: resultsComputed[model][2], reverse=True)

print('\nNews:')
resultsNews = show_results([resultsDoc['autoc'], resultsDoc['euroe']])

print('\nAudit:')
resultsAudit = show_results([resultsDoc['brouke'], resultsDoc['broukc']])

print('\nLease:')
resultsLease = show_results([resultsDoc['kufrc'], resultsDoc['kufre']])
 

print('\nDomain correlation:')
resultsNews =  [resultsNews[model][2] for model in models]
resultsAudit = [resultsAudit[model][2] for model in models]
resultsLease = [resultsLease[model][2] for model in models]

print(f'Audit-News:  {np.corrcoef(resultsAudit, resultsNews)[0][1]:.2f}')
print(f'Audit-Lease: {np.corrcoef(resultsAudit, resultsLease)[0][1]:.2f}')
print(f'News-Lease:  {np.corrcoef(resultsNews,  resultsLease)[0][1]:.2f}')


print('\nBLEU correlation')
modelBLEU = {
    'eTranslation': 0.3691897832532345,
    'CUNI-Transformer': 0.3472026636330126,
    'SRPOL': 0.3546712271356658,
    'Online-G': 0.2859323236822436,
    'zlabs-nlp': 0.26075427881625035,
    'CUNI-T2T-2018': 0.333755759265639,
    'CUNI-DocTransformer': 0.3585021115468853,
    'newstest2020-online-b.sgm': 0.37073245997262544,
    'OPPO': 0.35308716843303706,
    'UEDIN-CUNI': 0.3284552388267501,
    'newstest2020-online-z.sgm': 0.2667259413179943,
    'PROMT_NMT': 0.32099043296658347,
    'newstest2020-online-a.sgm': 0.31840133787298613,
    # 'ref': 0.3,
}

BLEUs = []
ratings = []
for model, bleu in modelBLEU.items():
    multT = show_results(resultsDoc.values(), False)[model][2]
    BLEUs.append(bleu)
    ratings.append(multT)
print(f'BLEU-rating correlation: {np.corrcoef(BLEUs, ratings)[0][1]:.2f}')

print('\n%%%'*4)

for model in models:
    multT = show_results(resultsDoc.values(), False)[model][2]
    multN = show_results([resultsDoc['autoc'], resultsDoc['euroe']], False)[model][2]
    multA = show_results([resultsDoc['brouke'], resultsDoc['broukc']], False)[model][2]
    multL = show_results([resultsDoc['kufrc'], resultsDoc['kufre']], False)[model][2]
    stdT = show_results(resultsDoc.values(), False)[model][3]
    print(nicename(model), '\\hspace{-0.2cm}', end='')
    print(' & ', '\\blocksimple{', f'{multT:.3f}', '}', sep='', end='')
    print(' & ', '\\blocksimple{', f'{multN:.3f}', '}', sep='', end='')
    print(' & ', '\\blocksimple{', f'{multA:.3f}', '}', sep='', end='')
    print(' & ', '\\blocksimple{', f'{multL:.3f}', '}', sep='', end='')
    print(' & ', f'{stdT:.2f}', sep='', end='\\\\\n')

print('\n%%%'*4)