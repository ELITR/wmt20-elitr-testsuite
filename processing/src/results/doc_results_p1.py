#!/usr/bin/env python3

from load import load_all_p1
from utils import niceNameDocArrow
import numpy as np
import re
import matplotlib.pyplot as plt

data = load_all_p1(add_bleu=True)

print('\n%%%'*4)

for docName in sorted(data['doc'].unique(), key=lambda docName: data[data['doc'] == docName].mean()['mult'], reverse=True):
    dfDoc = data[data['doc'] == docName]
    multAvg = dfDoc.mean()['mult']
    errsAvg = dfDoc['errors'].mean()
    bleuAvg = dfDoc['bleu'].mean()
    bleuStd = np.sqrt(dfDoc['bleu'].std())
    print(f'{niceNameDocArrow(docName):<9} & {multAvg:10.2f} & {errsAvg:10.2f} & {bleuAvg:10.2f}', '\\pmsmall{', f'{bleuStd:4.2f}' ,'} \\\\')

print('\\hline')
multAvg = data.mean()['mult']
errsAvg = data['errors'].mean()
bleuAvg = data['bleu'].mean()
bleuStd = np.sqrt(dfDoc['bleu'].std())
print(f'Average   & {multAvg:10.2f} & {errsAvg:10.2f} & {bleuAvg:10.2f}', '\\pmsmall{', f'{bleuStd:4.2f}' ,'} \\\\')
print('\\hline')

print('\n%%%'*4)

print('Fluency-Adequacy corr: ', data.corr()['fluency']['adequacy'])
print('Mult   -Errors   corr: ', data.corr()['mult']['errors'])