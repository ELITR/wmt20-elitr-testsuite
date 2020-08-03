#!/usr/bin/env python3

from load import load_all
import numpy as np
from utils import nicename, nicephn, badline, modelBLEUr, modelMULT

data = load_all()
resultsDoc = {}
sizesDoc = {}
models = set()
phnAll = set()

for (userName, userVal) in data.items():
    sizesDoc[userName] = 0
    # this assumes the user has only one document assigned
    for (docMkbName, docVal) in userVal.items():
        for (lineName, lineVal) in docVal.items():
            for (modelName, modelVal) in lineVal.items():
                if modelName == 'time':
                    continue
                models.add(modelName)
                for phn, severity in modelVal.items():
                    phnAll.add(phn)
                    if badline(phn, lineVal):
                        continue
                    resultsDoc.setdefault(userName, {}).setdefault(modelName, {}).setdefault(phn, []).append(float(severity))
            sizesDoc[userName] += 1
        
avg_all = lambda userName, phn: { name:(len(arr)/sizesDoc[userName], np.average(arr)) for name, arr in phn.items() }
avg_all_list = lambda phnDict: {name:(np.average([x[0] for x in arr]), np.average([x[1] for x in arr])) for name, arr in phnDict.items() }
phn_avg = lambda userNames, phnName: [np.average([compute_average(userNames).get(model, {}).get(phnName, (0,0))[x] for model in models]) for x in [0,1]]

def compute_average(userNames):
    resultsAll = {}
    for userName in userNames:
        doc = resultsDoc[userName]
        results = {model: avg_all(userName, phn) for (model, phn) in doc.items()}
        for model, phnAvgs in results.items():
            for phnName, val in phnAvgs.items():
                resultsAll.setdefault(model, {}).setdefault(phnName, []).append(val)

    resultsAll = {model: avg_all_list(phnDict) for (model, phnDict) in resultsAll.items()}

    return resultsAll


def compute_corr(userNames, phnName):
    phnResults = {}
    for userName in userNames:
        doc = resultsDoc[userName]
        results = {model: avg_all(userName, phn) for (model, phn) in doc.items()}
        for model, phnAvgs in results.items():
            phnResults.setdefault(model, []).append(phnAvgs.get(phnName, (0,0))[0]*phnAvgs.get(phnName, (0,0))[1])

    phnResults = {model: np.average(phnArr) for (model, phnArr) in phnResults.items()}
    modelsFixed = list(models)
    phnResults = [-phnResults[model] for model in models]
    bleuResults = [modelBLEUr[model] for model in models]
    multResults = [modelMULT[model] for model in models]
    return np.corrcoef(phnResults, bleuResults)[0][1], np.corrcoef(phnResults, multResults)[0][1]

print('\n%%%'*4)
phnAll = sorted(
    phnAll,
    key=lambda phnName: phn_avg(data.keys(), phnName)[0]*phn_avg(data.keys(), phnName)[1],
    reverse=True
)

NEWS_NAMES = [x for x in data.keys() if x.startswith('auto') or x.startswith('euro')]
AGGR_NAMES = [x for x in data.keys() if x.startswith('kufr')]
AUDT_NAMES = [x for x in data.keys() if x.startswith('brouk')]

# Average
resT0 = np.average([phn_avg(data.keys(), phnName)[0] for phnName in phnAll])
resN0 = np.average([phn_avg(NEWS_NAMES,  phnName)[0] for phnName in phnAll])
resA0 = np.average([phn_avg(AGGR_NAMES,  phnName)[0] for phnName in phnAll])
resL0 = np.average([phn_avg(AUDT_NAMES,  phnName)[0] for phnName in phnAll])

resT1 = np.average([phn_avg(data.keys(), phnName)[1] for phnName in phnAll])
resN1 = np.average([phn_avg(NEWS_NAMES,  phnName)[1] for phnName in phnAll])
resA1 = np.average([phn_avg(AGGR_NAMES,  phnName)[1] for phnName in phnAll])
resL1 = np.average([phn_avg(AUDT_NAMES,  phnName)[1] for phnName in phnAll])

corr0 = np.average([compute_corr(data.keys(), phnName)[0] for phnName in phnAll])
corr1 = np.average([compute_corr(data.keys(), phnName)[1] for phnName in phnAll])

print('Average', '\\hspace{-0.2cm}', end='')
print(' & ', '\\blockdual{', f'{resT0*2:.3f}', '}{' f'{resT1:.3f}', '}', sep='', end='')
print(' & ', '\\blockdual{', f'{resN0*2:.3f}', '}{' f'{resN1:.3f}', '}', sep='', end='')
print(' & ', '\\blockdual{', f'{resA0*2:.3f}', '}{' f'{resA1:.3f}', '}', sep='', end='')
print(' & ', '\\blockdual{', f'{resL0*2:.3f}', '}{' f'{resL1:.3f}', '}', sep='', end='')
print(' & ', f'{corr0:.2f}', sep='', end='') # bleu
print(' & ', f'{corr1:.2f}', sep='', end='') # mult
print('\\\\')

for phnName in phnAll:
    resT = phn_avg(data.keys(), phnName)
    resN = phn_avg(NEWS_NAMES, phnName)
    resA = phn_avg(AGGR_NAMES, phnName)
    resL = phn_avg(AUDT_NAMES, phnName)

    corr = compute_corr(data.keys(), phnName)
    
    print(nicephn(phnName), '\\hspace{-0.2cm}', end='')
    print(' & ', '\\blockdual{', f'{resT[0]*2:.3f}', '}{' f'{resT[1]:.3f}', '}', sep='', end='')
    print(' & ', '\\blockdual{', f'{resN[0]*2:.3f}', '}{' f'{resN[1]:.3f}', '}', sep='', end='')
    print(' & ', '\\blockdual{', f'{resA[0]*2:.3f}', '}{' f'{resA[1]:.3f}', '}', sep='', end='')
    print(' & ', '\\blockdual{', f'{resL[0]*2:.3f}', '}{' f'{resL[1]:.3f}', '}', sep='', end='')
    print(' & ', f'{corr[0]:.2f}', sep='', end='') # bleu
    print(' & ', f'{corr[1]:.2f}', sep='', end='') # mult
    print('\\\\')

print('\n%%%'*4)