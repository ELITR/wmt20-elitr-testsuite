#!/usr/bin/env python3

import mosestokenizer
import argparse
import yaml, re
from utils import nicename
from nltk.translate.bleu_score import corpus_bleu
import numpy as np

tokenizers = {
    'cs': mosestokenizer.MosesTokenizer('cs'),
    'en': mosestokenizer.MosesTokenizer('en')
}
def tokenize(text, language, join=True):
    """
    Tokenize text with mosestokenizer 
    """
    tokenize = tokenizers[language]
    tokens = tokenize(text)
    if join:
        tokens = ' '.join(tokens)
    return tokens


parser = argparse.ArgumentParser(
    description='Prepare annotated document content file')
parser.add_argument(
    'experiment_def', help='Path to the experiment definition YAML file')
parser.add_argument(
    'experiment_dir', help='Path to the root document directory')
parser.add_argument('--out-content', default='content.json',
                    help='Path to the output content JSON file')
args = parser.parse_args()


with open(args.experiment_def, 'r') as f:
    def_experiment = yaml.safe_load(f)

def_mts = def_experiment['mts']
def_docs = def_experiment['docs']
models = set()

tokenized = {}

for doc in def_docs:
    if doc.endswith('c'):
        LANG2 = 'en'
    else:
        LANG2 = 'cs'
    print(f'Tokenizing {doc}:')
    tokenized[doc] = {}

    for model in def_mts:
        filename = f'{args.experiment_dir}/{doc}/{model}.txt'
        with open(filename, 'r') as f:
            lines_mt = [x for x in f.readlines() if not re.match('^\s+$', x)]
        lines_mt = [tokenize(x, LANG2, False) for x in lines_mt]
        if model == 'PROMT_NMT-eTranslation':
            if LANG2 == 'cs':
                model = 'eTranslation'
            else:
                model = 'PROMT_NMT'
        tokenized[doc][model] = lines_mt
        models.add(model)

def compute_bleu(docs, model):
    bleus = []
    for doc in docs:
        if model in doc:
            lines_mt = doc[model]
            bleu = corpus_bleu([[x] for x in doc['ref']], lines_mt)
            bleus.append(bleu)
    if bleus:
        return np.average(bleus), np.std([x* 100 for x in bleus])
    else:
        return None, None

models.remove('ref')

print('\nDomain BLEU: ')
avgBLEUs = []
stdBLEUs = []

for doc in def_docs:
    avgBLEU = [compute_bleu([tokenized[doc]], model)[0] for model in models]
    avgBLEU = [x for x in avgBLEU if x]
    stdBLEU = [100*x for x in avgBLEU]
    
    docBLEU = np.average(avgBLEU)
    stdBLEU = np.std(stdBLEU)
    
    avgBLEUs.append(avgBLEU)
    stdBLEUs.append(stdBLEU)
    
    print(f'{doc}: {docBLEU*100:.2f} BLEU, +- {stdBLEU:.2f}')

avgBLEUs = np.average(avgBLEUs)
stdBLEUs = np.average(stdBLEUs)
print(f'Average: {avgBLEUs*100:.2f} BLEU +- {stdBLEUs:.2f}')


print('{')
for model in models:
    multT = compute_bleu(tokenized.values(), model)[0]
    print(f"'{model}': {multT},")
print('}')


print('\n%----------')

models = sorted(models, key=lambda model: compute_bleu(tokenized.values(), model), reverse=True)

for model in models:
    multT = compute_bleu(tokenized.values(), model)[0]
    multN = compute_bleu([tokenized['autoc'],  tokenized['euroe']], model)[0]
    multA = compute_bleu([tokenized['brouke'], tokenized['broukc']], model)[0]
    multL = compute_bleu([tokenized['kufrc'],  tokenized['kufre']], model)[0]
    stdT  = compute_bleu(tokenized.values(), model)[1]

    print(nicename(model), '\\hspace{-0.2cm}', end='')
    print(' & ', '\\blgrwh{', f'{multT*2:.3f}', '}{0}', sep='', end='')
    print(' & ', '\\blgrwh{', f'{multN*2:.3f}', '}{0}', sep='', end='')
    print(' & ', '\\blgrwh{', f'{multA*2:.3f}', '}{0}', sep='', end='')
    print(' & ', '\\blgrwh{', f'{multL*2:.3f}', '}{0}', sep='', end='')
    print(' & ', f'{stdT:.2f}', sep='', end='\\\\\n')

print('%----------')