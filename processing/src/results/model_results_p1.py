#!/usr/bin/env python3

from load import load_all
import numpy as np

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
            
avg_fluency = lambda arr: np.average([x[0] for x in arr])
avg_adequacy = lambda arr: np.average([x[1] for x in arr])
avg_mult = lambda arr: np.average([x[2] for x in arr])
avg_all = lambda arr: (avg_fluency(arr), avg_adequacy(arr), avg_mult(arr))
avg_all_list = lambda arr: (avg_fluency(arr), avg_adequacy(arr), avg_mult(arr))

def show_results(docs, printOut=True):
    resultsAll = {}
    for doc in docs:
        results = { k:avg_all(arr) for (k,arr) in doc.items()}
        for k,v in results.items():
            resultsAll.setdefault(k, []).append(v)            
    
    resultsAll = { k:avg_all_list(arr) for (k,arr) in resultsAll.items()}

    if printOut:
        print(f'{"model":<30}{"fluency":<10}{"adequacy":<10}{"multiply (sort)":<10}')
        for name,result in sorted(resultsAll.items(), key=lambda x: x[1][2], reverse=True):
            print(f'{name:<30}{result[0]:.2f}{result[1]:10.2f}{result[2]:10.2f}')

    return resultsAll


print('Total:')
resultsComputed = show_results(resultsDoc.values())

models = sorted(models, key=lambda model: resultsComputed[model][2], reverse=True)

print('\nNews:')
show_results([resultsDoc['autoc'], resultsDoc['euroe']])

print('\nAudit:')
show_results([resultsDoc['brouke'], resultsDoc['broukc']])

print('\nLease:')
show_results([resultsDoc['kufrc'], resultsDoc['kufre']])

print('\n%----------')
nicename = {
    'ref': 'Reference', 'PROMT_NMT': 'PROMT\\_NMT',
    'newstest2020-online-b.sgm': 'Online-B',
    'newstest2020-online-a.sgm': 'Online-A',
    'newstest2020-online-z.sgm': 'Online-Z'
}

for model in models:
    multT = show_results(resultsDoc.values(), False)[model][2]
    multN = show_results([resultsDoc['autoc'], resultsDoc['euroe']], False)[model][2]
    multA = show_results([resultsDoc['brouke'], resultsDoc['broukc']], False)[model][2]
    multL = show_results([resultsDoc['kufrc'], resultsDoc['kufre']], False)[model][2]
    print(nicename[model] if model in nicename else model, end='')
    print('&', '\\blgrwh{', str(multT)[:4], '}{0}', end='')
    print('&', '\\blgrwh{', str(multN)[:4], '}{0}', end='')
    print('&', '\\blgrwh{', str(multA)[:4], '}{0}', end='')
    print('&', '\\blgrwh{', str(multL)[:4], '}{0}', '\\\\')

print('%----------')