#!/usr/bin/env python3

from load import load_all
import numpy as np

data = load_all()

modelCDTn = 'CUNI-DocTransformer'
modelCTTn = 'CUNI-T2T-2018'
modelREFn = 'ref'

for (userKey, user) in data.items():
    for (docKey, document) in user.items():
        for (lineKey, line) in document.items():

            modelCDT = line[modelCDTn]
            modelCTT = line[modelCTTn]
            modelREF = line[modelREFn]
            if 'fluency' not in modelCDT or 'adequacy' not in modelCDT:
                continue
            if 'fluency' not in modelCTT or 'adequacy' not in modelCTT:
                continue
            if 'fluency' not in modelREF or 'adequacy' not in modelREF:
                continue
            scoreCDT = float(modelCDT['fluency'])*float(modelCDT['adequacy'])
            scoreCTT = float(modelCTT['fluency'])*float(modelCTT['adequacy'])
            scoreREF = float(modelREF['fluency'])*float(modelREF['adequacy'])
            

            if scoreCDT > scoreREF + 0.5 and scoreCDT > scoreCTT + 0.5:
                print(f'CDT: {float(modelCDT["fluency"]):3.2f}, {float(modelCDT["adequacy"]):3.2f}, {scoreCDT:3.2f}')
                print(f'CTT: {float(modelCTT["fluency"]):3.2f}, {float(modelCTT["adequacy"]):3.2f}, {scoreCTT:3.2f}')
                print(f'REF: {float(modelREF["fluency"]):3.2f}, {float(modelREF["adequacy"]):3.2f}, {scoreREF:3.2f}')
                print(f'--  {userKey:<9} {docKey:<7} {lineKey:<4}')