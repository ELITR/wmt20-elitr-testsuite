#!/usr/bin/env python3

import argparse
import yaml
import json
import markables
import random

parser = argparse.ArgumentParser(description='Prepare user queues')
parser.add_argument(
    'experiment_def', help='Path to the experiment definition YAML file')
parser.add_argument(
    'experiment_dir', help='Path to the root document directory')
parser.add_argument('--out-queue', default='queue_user.json',
                    help='Path to the output queue JSON file')
args = parser.parse_args()

if __name__ == '__main__':
    with open(args.experiment_def, 'r') as f:
        def_experiment = yaml.safe_load(f)

    def_markables = def_experiment['markables']
    def_docs = def_experiment['docs']
    def_users = def_experiment['users']

    content = {}
    doc_markables = {}
    for doc in def_docs:
        filename = f'{args.experiment_dir}/{doc}_src.xml'
        with open(filename, 'r') as f:
            text = f.read()
        doc_markables[doc] = dict(filter(lambda x: x[1] != 0, markables.distribution(text, def_markables).items())).keys()

    for user in def_users:
        obj = {}
        obj['progress'] = {
            "doc": 0,
            "mkb": 0,
            "sec": 0
        }
        obj['queue_doc'] = random.sample(def_docs, len(def_docs))
        obj['queue_mkb'] = {}
        for doc in def_docs:
            target_markables = doc_markables[doc]
            obj['queue_mkb'][doc] = random.sample(target_markables, len(target_markables))

        content[user] = obj

    with open(args.out_queue, 'w') as f:
        json.dump(content, f, ensure_ascii=False)
