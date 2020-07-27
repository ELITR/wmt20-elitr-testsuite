#!/usr/bin/env python3

from load import load_all

data = load_all()
errors = []

for user in data.values():
    for docName, document in user.items():
        for line in document.values():
            for (name, model) in line.items():
                if name == 'time':
                    continue
                if model['errors'] != '':
                    errors += [docName + ': ' + x.strip() for x in model['errors'].lower().replace('.', '').replace(')', '').replace('(', '').split(',')]
            

errors = set(errors)

print(f'{len(errors)} distinct markable proposals')
print('\n'.join(errors))