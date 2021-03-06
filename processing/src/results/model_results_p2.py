#!/usr/bin/env python3

import numpy as np
from utils import niceNameModel, niceNamePhn, PHNALL
from load import load_all_p2
import pandas as pd

data = load_all_p2(clear_badlines=True)

def comp_occ(df, phnName):
    return df[phnName].count()/df.shape[0]
def comp_sev(df, phnName):
    tmp = df[phnName].dropna()
    if tmp.shape[0] == 0:
        return 0
    else:
        return tmp.mean()



modelKey = {}
modelPhnKey = {}
phnKey = {}
for model in data['model'].unique():
    dfModel = data[data['model'] == model]
    phnDict = {phnName:(comp_occ(dfModel, phnName), comp_sev(dfModel, phnName)) for phnName in PHNALL}
    modelPhnKey[model] = phnDict
    modelKey[model] = (np.average([x[0] for x in phnDict.values()]), np.average([x[1] for x in phnDict.values()]))

print('Correlations')
for phnName in PHNALL:
    phnKey[phnName] = [modelV[phnName][0]*modelV[phnName][1] for modelV in modelPhnKey.values()]
corrs = {}
for (i, phnName1) in enumerate(PHNALL):
    for phnName2 in PHNALL[(i+1):]:
        corrs[phnName1 + '-' + phnName2] = np.corrcoef([phnKey[phnName1], phnKey[phnName2]])[0][1]
print('\n'.join([k + ': ' + str(v) for k,v in  corrs.items() if abs(v) >= 0.6]))


print('\n%%%'*4)

PHNALL = sorted(
    PHNALL,
    key=lambda phnName: comp_occ(data, phnName)*comp_sev(data, phnName),
    reverse=True
)

print(' & ', '\\rot{Average}')
for phnName in PHNALL:
    print(' & ', '\\rot{', f'{niceNamePhn(phnName)}', '}', end='')
print('\\\\\n')

for model in sorted(data['model'].unique(), key=lambda model: modelKey[model][0]*modelKey[model][1]):
    dfModel = data[data['model'] == model]
    print(niceNameModel(model), '\\hspace{-0.2cm}', end='')
    
    print(' & ', '\\blockdual{', f'{modelKey[model][0]/0.2:.3f}', '}{' f'{modelKey[model][1]:.3f}', '}', sep='', end='')
    for phnName in PHNALL:
        avgOcc = comp_occ(dfModel, phnName)
        avgSev = comp_sev(dfModel, phnName)
        print(' & ', '\\blockdual{', f'{avgOcc/0.2:.3f}', '}{' f'{avgSev:.3f}', '}', sep='', end='')
    print('\\\\')

print('\n%%%'*4)
