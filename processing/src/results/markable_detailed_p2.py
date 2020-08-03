#!/usr/bin/env python3

from load import load_all
import numpy as np
from utils import nicename, nicephn, badline

data = load_all()
resultsMkbStable = {}
sizesMkb = {}
phnAll = set()

for (userName, userVal) in data.items():
    for (docMkbName, docVal) in userVal.items():
        mkbName = docMkbName.split('-')[1]
        for (lineName, lineVal) in docVal.items():
            for (modelName, modelVal) in lineVal.items():
                if modelName == 'time':
                    continue
                for phn, severity in modelVal.items():
                    phnAll.add(phn)
                    if badline(phn, lineVal):
                        continue
                    resultsMkbStable.setdefault(mkbName, {}).setdefault(
                        phn, []).append(float(severity))

                sizesMkb[mkbName] = sizesMkb.get(mkbName, 0)+1

resultsMkb = dict(resultsMkbStable)


def aggregate_phn(mkbName, mkbDict): return {phnName: (len(
    phnArr)/sizesMkb[mkbName])*np.average(phnArr) for phnName, phnArr in mkbDict.items()}


resultsMkb = {mkbName: aggregate_phn(mkbName, mkbDict)
              for mkbName, mkbDict in resultsMkb.items()}

# average products (drop phenomena distinction)
resultsMkb = {mkbName: np.average(list(mkbDict.values()))
              for mkbName, mkbDict in resultsMkb.items()}

resultsMkb = sorted(resultsMkb.items(), key=lambda x: x[1], reverse=True)

for mkbName, mkbMult in resultsMkb:
    print()
    print(f'{mkbName:<30} {mkbMult:.3f} (Occ*Sev)')
    mkbDict = resultsMkbStable[mkbName]
    for phnName, phnArr in mkbDict.items():
        print(
            f'- {phnName:<28} {len(phnArr)/sizesMkb[mkbName]:.3f} (Occ), {np.average(phnArr):.3f} (Sev)')
