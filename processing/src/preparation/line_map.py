#!/usr/bin/env python3

import argparse
import yaml
import json
import markables
import re
from tokenize import tokenize

parser = argparse.ArgumentParser(description='Prepare annotated document content file')
parser.add_argument('experiment_def')
parser.add_argument('experiment_dir')
parser.add_argument('--out-mapping', default='line_mapping.json')
args = parser.parse_args()

if __name__ == '__main__':
    with open(args.experiment_def, 'r') as f:
        def_experiment = yaml.safe_load(f)

    def_markables = def_experiment['markables']
    def_docs = def_experiment['docs']

    content = {}

    for doc in def_docs:
        filename = f'{args.experiment_dir}/{doc}/src.txt'
        with open(filename, 'r') as f:
            lines_src = [ x for x in f.readlines() if not re.match('^\s+$',x )]

        text = ''.join(lines_src)
        indicies, _ = markables.indicies(text, def_markables)

        indicies = {k:[x[1] for x in v] for k,v in indicies.items()}

        content[doc] = {}
        for mkbName, mkbVal in indicies.items():
            content[doc][mkbName] = {}
            for index, position in enumerate(mkbVal):
                content[doc][mkbName][index] = text[:position].count('\n')

    with open(args.out_mapping, 'w') as f:
        json.dump(content, f, ensure_ascii=False)