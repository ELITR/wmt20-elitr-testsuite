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
                    if badline(phn, lineVal):
                        continue
                    resultsDoc.setdefault(userName, {}).setdefault(modelName, {}).setdefault(phn, []).append(float(severity))
                    phnAll.add(phn)
            sizesDoc[userName] += 1
        
avg_all = lambda userName, phn: { name:(len(arr)/sizesDoc[userName], np.average(arr)) for name, arr in phn.items() }
avg_all_list = lambda phnDict: {name:(np.average([x[0] for x in arr]), np.average([x[1] for x in arr])) for name, arr in phnDict.items() }

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
    key=lambda phnName: np.average([compute_average(data.keys())[model].get(phnName, (0,0))[0] for model in models])*np.average([compute_average(data.keys())[model].get(phnName, (0,0))[1] for model in models]),
    reverse=True
)

print(' & ', '\\rot{Average}', end='')
for phnName in phnAll:
    print(' & ', '\\rot{', f'{nicephn(phnName)}', '}', end='')
print('\\\\\n')

modelKey = {}
for model in models:
    phnDict = compute_average(data.keys())[model]
    occurenceAvg, severityAvg = np.average([x[0] for x in phnDict.values()]), np.average([x[1] for x in phnDict.values()])
    modelKey[model] = occurenceAvg, severityAvg

for model in sorted(models, key=lambda model: modelKey[model][1]):
    phnDict = compute_average(data.keys())[model]
    print(nicename(model), '\\hspace{-0.2cm}', end='')

    print(' & ', '\\blockdual{', f'{modelKey[model][0]*2:.3f}', '}{' f'{modelKey[model][1]:.3f}', '}', sep='', end='')
    for phnName in phnAll:
        occurenceAvg, severityAvg = phnDict.get(phnName, (0,0))
        print(' & ', '\\blockdual{', f'{occurenceAvg*2:.3f}', '}{' f'{severityAvg:.3f}', '}', sep='', end='')
    print('\\\\')

print('\n%%%'*4)
