#!/usr/bin/env python3

import numpy as np
import pandas as pd
from load import load_all_p1, load_all_p2, add_bleu
from utils import nicename, nicephn, PHNALL

data = load_all_p2(clear_badlines=True)
dataP1 = load_all_p1(add_bleu=True)

# create domains
dataN = data.loc[data['domain'] ==  'news']
dataA = data.loc[data['domain'] == 'audit']
dataL = data.loc[data['domain'] == 'lease']

def comp_occ(df, phnName):
    return df.count()[phnName]/df.shape[0]
def comp_sev(df, phnName):
    tmp = df[phnName].dropna()
    if tmp.shape[0] == 0:
        return 0
    else:
        return tmp.mean()

PHNALL = sorted(PHNALL,
    key=lambda phnName: comp_occ(data, phnName)*comp_sev(data, phnName),
    reverse=True
)

print('\n%%%'*4)

occT = np.average([comp_occ(data, phnName) for phnName in PHNALL])
sevT = np.average([comp_sev(data, phnName) for phnName in PHNALL])
occN = np.average([comp_occ(dataN, phnName) for phnName in PHNALL])
sevN = np.average([comp_sev(dataN, phnName) for phnName in PHNALL])
occA = np.average([comp_occ(dataA, phnName) for phnName in PHNALL])
sevA = np.average([comp_sev(dataA, phnName) for phnName in PHNALL])
occL = np.average([comp_occ(dataL, phnName) for phnName in PHNALL])
sevL = np.average([comp_sev(dataL, phnName) for phnName in PHNALL])

stoScores = pd.Series(
    data=data.groupby('model').apply(
        lambda df: np.average([comp_occ(df, phnName)*comp_sev(df, phnName) for phnName in PHNALL])
    ),
    name='sto'
)
corrScores = dataP1.groupby('model').mean()[['mult', 'bleu']].join(stoScores).corr()['sto']
corrBLEU = corrScores['bleu']
corrMULT = corrScores['mult']

print('Average \\hspace{-0.2cm}', end='')
print(' & \\blockdual{', f'{occT/0.2:.3f}', '}{' f'{sevT:.3f}', '}', sep='', end='')
print(' & \\blockdual{', f'{occN/0.2:.3f}', '}{' f'{sevN:.3f}', '}', sep='', end='')
print(' & \\blockdual{', f'{occA/0.2:.3f}', '}{' f'{sevA:.3f}', '}', sep='', end='')
print(' & \\blockdual{', f'{occL/0.2:.3f}', '}{' f'{sevL:.3f}', '}', sep='', end='')
print(' & ', f'{corrBLEU:.2f}', sep='', end='')  # bleu
print(' & ', f'{corrMULT:.2f}', sep='', end='')  # mult
print('\\\\')

for phnName in PHNALL:
    occT = comp_occ(data, phnName)
    sevT = comp_sev(data, phnName)
    occN = comp_occ(dataN, phnName)
    sevN = comp_sev(dataN, phnName)
    occA = comp_occ(dataA, phnName)
    sevA = comp_sev(dataA, phnName)
    occL = comp_occ(dataL, phnName)
    sevL = comp_sev(dataL, phnName)

    stoScores = pd.Series(
        data=data.groupby('model').apply(
            lambda df: comp_occ(df, phnName)*comp_sev(df, phnName)
        ),
        name='sto'
    )
    corrScores = dataP1.groupby('model').mean()[['mult', 'bleu']].join(stoScores).corr()['sto']
    corrBLEU = corrScores['bleu']
    corrMULT = corrScores['mult']

    print(nicephn(phnName), '\\hspace{-0.2cm}', end='')
    print(' & \\blockdual{', f'{occT*5:.3f}', '}{' f'{sevT:.3f}', '}', sep='', end='')
    print(' & \\blockdual{', f'{occN*5:.3f}', '}{' f'{sevN:.3f}', '}', sep='', end='')
    print(' & \\blockdual{', f'{occA*5:.3f}', '}{' f'{sevA:.3f}', '}', sep='', end='')
    print(' & \\blockdual{', f'{occL*5:.3f}', '}{' f'{sevL:.3f}', '}', sep='', end='')
    print(' & ', f'{corrBLEU:.2f}', sep='', end='')  # bleu
    print(' & ', f'{corrMULT:.2f}', sep='', end='')  # mult
    print('\\\\')

print('\n%%%'*4)