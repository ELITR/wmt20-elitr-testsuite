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
parser.add_argument('--doc-user-overlap', default=5,
                    help='How much extra users per one document to generate')
args = parser.parse_args()

if __name__ == '__main__':
    with open(args.experiment_def, 'r') as f:
        def_experiment = yaml.safe_load(f)

    def_markables = def_experiment['markables']
    def_docs = def_experiment['docs']
    def_users = def_experiment['users']
    def_mts = def_experiment['mts']

    content = {}
    doc_markables = {}
    for doc in def_docs:
        filename = f'{args.experiment_dir}/{doc}/src.txt'
        with open(filename, 'r') as f:
            text = f.read()
        doc_markables[doc] = markables.indicies_visible(text, def_markables)

    print('\nNormal users:')
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

        obj['queue_mt'] = {}
        for doc in def_docs:
            obj['queue_mt'][doc] = random.sample(def_mts, len(def_mts))

        content[user] = obj
        print(user)

    print('\nDocument users:')
    for doc in def_docs:
        for index in range(args.doc_user_overlap):
            name = f'{doc}-{index}'
            obj = {}
            obj['progress'] = {
                "doc": 0,
                "mkb": 0,
                "sec": 0
            }
            obj['queue_doc'] = [doc]
            target_markables = doc_markables[doc]
            obj['queue_mkb'] = { doc: random.sample(target_markables, len(target_markables)) }

            obj['queue_mt'] = {doc: random.sample(def_mts, len(def_mts))}
            content[name] = obj
            print(name)

    with open(args.out_queue, 'w') as f:
        json.dump(content, f, ensure_ascii=False)
