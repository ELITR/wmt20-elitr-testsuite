#!/usr/bin/env python3

import argparse
import yaml
import json
import markables
import re

parser = argparse.ArgumentParser(description='Prepare annotated document content file')
parser.add_argument(
    'experiment_def', help='Path to the experiment definition YAML file')
parser.add_argument(
    'experiment_dir', help='Path to the root document directory')
parser.add_argument('--out-content', default='content.json',
                    help='Path to the output content JSON file')
args = parser.parse_args()

if __name__ == '__main__':
    with open(args.experiment_def, 'r') as f:
        def_experiment = yaml.safe_load(f)

    def_markables = def_experiment['markables']
    def_mts = def_experiment['mts']
    def_docs = def_experiment['docs']

    content = {}
    content['names_mt'] = def_mts
    content['content_src'] = {}
    content['content_mt'] = {}
    content['indicies_src'] = {}

    for doc in def_docs:
        content['content_mt'][doc] = {}

        filename = f'{args.experiment_dir}/{doc}_src.txt'
        with open(filename, 'r') as f:
            text = list(filter(lambda x: not re.match('^\s+$', x), f.readlines()))
            lines_src = len(text)
            text = ''.join(text)
            indicies = markables.indicies(text, def_markables)
            content['content_src'][doc] = text
            content['indicies_src'][doc] = indicies
            print(f'{doc} lines', lines_src)

        for mt in def_mts:
            filename = f'{args.experiment_dir}/{doc}_{mt}.txt'
            with open(filename, 'r') as f:
                text = list(filter(lambda x: not re.match('^\s+$', x), f.readlines()))
                lines_mt = len(text)
                text = ''.join(text)
                content['content_mt'][doc][mt] = text
                assert(lines_src == lines_mt)


    with open(args.out_content, 'w') as f:
        json.dump(content, f, ensure_ascii=False)