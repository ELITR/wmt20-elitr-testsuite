#!/usr/bin/env python3

from load import load_all
import numpy as np
import re
import matplotlib.pyplot as plt

data = load_all()
results = {}
markables = {}

for user in data.values():
    for (docName, document) in user.items():
        docMkbs = set()
        for line in document.values():
            for (modelName, model) in line.items():
                if modelName == 'time':
                    continue
                if 'fluency' in model and 'adequacy' in model:
                    errors = re.split(r'\W', model['errors'])
                    errors = [x.lower()
                              for x in errors if x != '' and len(x) >= 2]
                    docMkbs.update(set(errors))
                    results.setdefault(docName, []).append(
                        (float(model['fluency']), float(model['adequacy'])))
        markables[docName] = len(docMkbs)/len(document.values())


def avg_fluency(arr): return np.average([x[0] for x in arr])
def avg_adequacy(arr): return np.average([x[1] for x in arr])
def avg_all(arr): return (avg_fluency(arr), avg_adequacy(arr))


results = {k: avg_all(arr) for (k, arr) in results.items()}
results = {k: (x[0], x[1], x[0]*x[1]) for (k, x) in results.items()}
resultsItems = sorted(results.items(), key=lambda x: x[1][2], reverse=True)

print(f'{"Document":<10} & {"Fluency":<10} & {"Adequacy":<10} & {"Multiply (sort)":<10} & {"Wrong markables":<10} \\\\')
for name, result in resultsItems:
    print(f'{name:<10} & {result[0]:.2f} & {result[1]:10.2f} & {result[2]:10.2f} & {markables[name]:10.2f}  \\\\')

fluencyTotal = np.average([x[1][0] for x in resultsItems])
adequacyTotal = np.average([x[1][1] for x in resultsItems])
multiTotal = np.average([x[1][2] for x in resultsItems])
markablesTotal = np.average([markables[x[0]] for x in resultsItems])

print(f'Average    & {fluencyTotal:.2f} & {adequacyTotal:10.2f} & {multiTotal:10.2f} & {markablesTotal:10.2f}  \\\\')


resultsFluency = [x[1][0] for x in resultsItems]
resultsAdequacy = [x[1][1] for x in resultsItems]
resultsMult = [x[1][2] for x in resultsItems]
resultsErrors = [markables[x[0]] for x in resultsItems]

print() 

print('Fluency-Adequacy corr: ', np.corrcoef(resultsFluency, resultsAdequacy)[0][1])
print('Mult   -Errors   corr: ', np.corrcoef(resultsMult, resultsErrors)[0][1])