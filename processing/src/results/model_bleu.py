#!/usr/bin/env python3

import numpy as np
from utils import niceNameModel
from load import load_all_p1
import pandas as pd

data = load_all_p1(add_bleu=True)
data = data[data['model'] != 'ref']

print('\n%%%'*4)

for model in sorted(data['model'].unique(), key=lambda modelName:data[data['model'] == modelName]['bleu'].mean(), reverse=True):
    dfModel = data[data['model'] == model]

    multT = dfModel['bleu'].mean()
    stdT  = dfModel.groupby('doc').mean()['bleu'].std()
    multN = dfModel[dfModel['domain'] ==  'news']['bleu'].mean()
    multA = dfModel[dfModel['domain'] == 'audit']['bleu'].mean()
    multL = dfModel[dfModel['domain'] == 'lease']['bleu'].mean()

    print(niceNameModel(model), '\\hspace{-0.2cm}', end='')
    print(' & ', '\\blocksimple{', f'{(multT-15)/(40-15):.3f}', '}', sep='', end='')
    print(' & ', '\\blocksimple{', f'{(multN-15)/(40-15):.3f}', '}', sep='', end='')
    print(' & ', '\\blocksimple{', f'{(multA-15)/(40-15):.3f}', '}', sep='', end='')
    print(' & ', '\\blocksimple{', f'{(multL-15)/(40-15):.3f}', '}', sep='', end='')
    print(' & ', f'{stdT:.2f}', sep='', end='\\\\\n')

print('\n%%%'*4)

print('Domain correlation:')

dataN = pd.DataFrame(data=data[data['domain'] ==  'news'][['bleu', 'model']]).groupby('model').mean()
dataA = pd.DataFrame(data=data[data['domain'] == 'audit'][['bleu', 'model']]).groupby('model').mean()
dataL = pd.DataFrame(data=data[data['domain'] == 'lease'][['bleu', 'model']]).groupby('model').mean()
dataN = pd.DataFrame(np.array(dataN), index=dataN.index, columns=['bleu_n'])
dataA = pd.DataFrame(np.array(dataA), index=dataA.index, columns=['bleu_a'])
dataL = pd.DataFrame(np.array(dataL), index=dataL.index, columns=['bleu_l'])

dataT = dataN.join([dataA, dataL])
print(dataT.corr())
print(dataT.std())
