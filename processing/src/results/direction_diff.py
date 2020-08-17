#!/usr/bin/env python3

import numpy as np
from utils import niceNameModel, PHNALL
from load import load_all_p1, load_all_p2
import pandas as pd
import matplotlib.pyplot as plt

if False:
    dataP1 = load_all_p1(add_bleu=True)[['model', 'lang', 'fluency', 'adequacy', 'bleu']]
    dataP1['mult'] = dataP1['fluency']*dataP1['adequacy']
    # data = data.drop(['fluency', 'adequacy'], axis=1)

    for model in dataP1['model'].unique():
        diff = dataP1[dataP1['model'] == model].groupby('lang').mean()
        print(model)
        print(diff)
        print()
else:
    dataP2 = load_all_p2(add_bleu=False)

    def comp_occ(df, phnName):
        return df[phnName].count()/df.shape[0]
    def comp_sev(df, phnName):
        tmp = df[phnName].dropna()
        if tmp.shape[0] == 0:
            return 0
        else:
            return tmp.mean()


    # for model in dataP2['model'].unique():
    model = 'CUNI-DocTransformer'
    dataE = dataP2[(dataP2['model'] == model) & (dataP2['lang'] == 'en')]
    dataC = dataP2[(dataP2['model'] == model) & (dataP2['lang'] == 'cs')]

    occE = np.average([comp_occ(dataE, phnName) for phnName in PHNALL])
    sevE = np.average([comp_sev(dataE, phnName) for phnName in PHNALL])
    occC = np.average([comp_occ(dataC, phnName) for phnName in PHNALL])
    sevC = np.average([comp_sev(dataC, phnName) for phnName in PHNALL])

    print(model, 'en', 'cs')
    print(occE, occC)
    print(sevE, sevC)
    # print(occE*sevE-occC*sevC)
    print()
    for phnName in PHNALL:
        occE = comp_occ(dataE, phnName)
        sevE = comp_sev(dataE, phnName)
        occC = comp_occ(dataC, phnName)
        sevC = comp_sev(dataC, phnName)

        print(phnName, 'en', 'cs')
        print(occE, occC, occE-occC)
        print(sevE, sevC, sevE-sevC)
        print()
            

        


    dataE = dataP2[(dataP2['lang'] == 'en')]
    dataC = dataP2[(dataP2['lang'] == 'cs')]

    occE = np.average([comp_occ(dataE, phnName) for phnName in PHNALL])
    sevE = np.average([comp_sev(dataE, phnName) for phnName in PHNALL])
    occC = np.average([comp_occ(dataC, phnName) for phnName in PHNALL])
    sevC = np.average([comp_sev(dataC, phnName) for phnName in PHNALL])

    print('total', 'en', 'cs')
    print(occE, occC, occE-occC)
    print(sevE, sevC, sevE-sevC)