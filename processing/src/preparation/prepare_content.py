#!/usr/bin/env python3

import argparse
import yaml
import json
import markables
import re
from tokenize import tokenize

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

        filename = f'{args.experiment_dir}/{doc}/src.txt'
        with open(filename, 'r') as f:
            lines_src = list(filter(lambda x: not re.match('^\s+$', x), f.readlines()))
        text = ''.join(lines_src)
        indicies = markables.indicies(text, def_markables)
        content['content_src'][doc] = text
        content['indicies_src'][doc] = indicies
        print(f'{doc} lines', len(lines_src))

        # ALIGNMENT ATTEMPT
        # if doc.endswith('c'):
        #     LANG = 'cs'
        # elif doc.endswith('e'):
        #     LANG = 'en'
        # else:
        #     raise Exception('Unable to identify document language.')
        # tokenized_src = [tokenize(x, LANG, False) for x in lines_src]

        # tok_pos_markables = {}
        # for markable in def_markables:
        #     head = markable[0]
        #     for (index, tok_line) in enumerate(tokenized_src):
        #         for markable_value in markable:
        #             # assuming non-sensitive matching
        #             occurences = [i for i, x in enumerate(tok_line) if x.lower() == markable_value.lower()]
        #             if occurences:
        #                 tok_pos_markables.setdefault(head, {})[index] = occurences

        for mt in def_mts:
            filename = f'{args.experiment_dir}/{doc}/{mt}.txt'
            with open(filename, 'r') as f:
                lines_mt = list(filter(lambda x: not re.match('^\s+$', x), f.readlines()))

            # ALIGNMENT ATTEMPT
            # filename = f'{args.experiment_dir}/{doc}/{mt}.txt.a'
            # with open(filename, 'r') as f:
            #     alignment = f.readlines()
            # tokenized_mt = [tokenize(x, LANG, False) for x in lines_mt]

            # for head, src_tok_pos_line in tok_pos_markables.items():
            #     for src_line, src_tok_pos_all in src_tok_pos_line.items():
            #         # print(head, src_line, src_tok_pos_all)
            #         alignment_line = alignment[src_line]
            #         tokenized_line = tokenized_mt[src_line]
            #         for src_token_pos in src_tok_pos_all:
            #             match = re.findall(f'{src_token_pos}\-(\d+)', alignment_line)
            #             if match:
            #                 # assert that the markable source does not get aligned to more than one word
            #                 # print(match)
            #                 # assert(len(match) == 1)
            #                 # print(match.group(1))
            #                 words = [tokenized_line[int(x)] for x in match]
            #                 print(head, match, words)
            #             else:
            #                 pass
            #                 # print('Align fail')

            text = ''.join(lines_mt)
            content['content_mt'][doc][mt] = text
            assert(len(lines_src) == len(lines_mt))


    with open(args.out_content, 'w') as f:
        json.dump(content, f, ensure_ascii=False)