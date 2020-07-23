#!/usr/bin/env python3

from load import load_all
import numpy as np

data = load_all()
results = {}

for user in data.values():
    for document in user.values():
        for line in document.values():
            for (name, model) in line.items():
                if name == 'time':
                    continue
                if 'fluency' in model and 'adequacy' in model:
                    results.setdefault(name, []).append((float(model['fluency']), float(model['adequacy'])))
            
avg_fluency = lambda arr: np.average([x[0] for x in arr])
avg_adequacy = lambda arr: np.average([x[1] for x in arr])
# avg_all = lambda arr: avg_fluency(arr)
avg_all = lambda arr: (avg_fluency(arr), avg_adequacy(arr))

results = { k:avg_all(arr) for (k,arr) in results.items()}
results = { k:(x[0], x[1], x[0]*x[1]) for (k,x) in results.items()}

print(f'{"model":<30}{"fluency":<10}{"adequacy":<10}{"multiply (sort)":<10}')
for name,result in sorted(results.items(), key=lambda x: x[1][2], reverse=True):
    print(f'{name:<30}{result[0]:.2f}{result[1]:10.2f}{result[2]:10.2f}')