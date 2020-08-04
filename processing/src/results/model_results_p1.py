#!/usr/bin/env python3

import numpy as np
from utils import nicename
from load import load_all_p1
import pandas as pd

data = load_all_p1(add_bleu=True)


print('\n%%%'*4)

for model in sorted(data['model'].unique(), key=lambda modelName:data[data['model'] == modelName]['mult'].mean(), reverse=True):
    dfModel = data[data['model'] == model]

    multT = dfModel['mult'].mean()
    stdT  = np.sqrt(dfModel['mult'].std())
    multN = dfModel[dfModel['domain'] ==  'news']['mult'].mean()
    multA = dfModel[dfModel['domain'] == 'audit']['mult'].mean()
    multL = dfModel[dfModel['domain'] == 'lease']['mult'].mean()

    print(nicename(model), '\\hspace{-0.2cm}', end='')
    print(' & ', '\\blocksimple{', f'{(multT-0.4)/(1-0.4):.3f}', '}', sep='', end='')
    print(' & ', '\\blocksimple{', f'{(multN-0.4)/(1-0.4):.3f}', '}', sep='', end='')
    print(' & ', '\\blocksimple{', f'{(multA-0.4)/(1-0.4):.3f}', '}', sep='', end='')
    print(' & ', '\\blocksimple{', f'{(multL-0.4)/(1-0.4):.3f}', '}', sep='', end='')
    print(' & ', f'{stdT:.2f}', sep='', end='\\\\\n')

print('\n%%%'*4)

print('Domain correlation:')
dataN = pd.DataFrame(data=data[data['domain'] ==  'news'][['mult', 'model']]).groupby('model').mean()
dataA = pd.DataFrame(data=data[data['domain'] == 'audit'][['mult', 'model']]).groupby('model').mean()
dataL = pd.DataFrame(data=data[data['domain'] == 'lease'][['mult', 'model']]).groupby('model').mean()
dataN = pd.DataFrame(np.array(dataN), index=dataN.index, columns=['mult_n'])
dataA = pd.DataFrame(np.array(dataA), index=dataA.index, columns=['mult_a'])
dataL = pd.DataFrame(np.array(dataL), index=dataL.index, columns=['mult_l'])

dataT = dataN.join([dataA, dataL])
print(dataT.corr())

data = data[data['model'] != 'ref']
print(f"BLEU-rating correlation: {data.groupby('model').mean().corr()['bleu']['mult']:.2f}")