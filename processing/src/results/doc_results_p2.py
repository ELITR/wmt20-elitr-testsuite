#!/usr/bin/env python3

from load import load_all
import numpy as np
from utils import nicename, nicephn, badline

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


print('\n%%%'*4)
phnAll = sorted(
    phnAll,
    key=lambda phnName: phn_avg(data.keys(), phnName)[0]*phn_avg(data.keys(), phnName)[1],
    reverse=True
)

for phnName in phnAll:
    resT = phn_avg(data.keys(), phnName)
    # TODO: this needs to be manually updated
    resN = phn_avg(['euroe-0'], phnName)
    resA = phn_avg(['kufrc-1', 'kufre-0'], phnName)
    resL = phn_avg(['broukc-0', 'brouke-0'], phnName)
    
    print(nicephn(phnName), '\\hspace{-0.2cm}', end='')
    print(' & ', '\\blockdual{', f'{resT[0]*2:.3f}', '}{' f'{resT[1]:.3f}', '}', sep='', end='')
    print(' & ', '\\blockdual{', f'{resN[0]*2:.3f}', '}{' f'{resN[1]:.3f}', '}', sep='', end='')
    print(' & ', '\\blockdual{', f'{resA[0]*2:.3f}', '}{' f'{resA[1]:.3f}', '}', sep='', end='')
    print(' & ', '\\blockdual{', f'{resL[0]*2:.3f}', '}{' f'{resL[1]:.3f}', '}', sep='', end='')
    print('\\\\')

print('\n%%%'*4)