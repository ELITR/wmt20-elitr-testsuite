#!/usr/bin/env python3

import argparse
import yaml
import json
import markables

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
    content['mts'] = def_mts
    content['content_src'] = {}
    content['content_mt'] = {}
    content['indicies_src'] = {}

    for doc in def_docs:
        content['content_mt'][doc] = {}

        for mt in def_mts:
            filename = f'{args.experiment_dir}/{doc}_{mt}.txt'
            with open(filename, 'r') as f:
                text = f.read()
                content['content_mt'][doc][mt] = text

        filename = f'{args.experiment_dir}/{doc}_src.txt'
        with open(filename, 'r') as f:
            text = f.read()
            indicies = markables.indicies(text, def_markables)
            content['content_src'][doc] = text
            content['indicies_src'][doc] = indicies

    with open(args.out_content, 'w') as f:
        json.dump(content, f, ensure_ascii=False)