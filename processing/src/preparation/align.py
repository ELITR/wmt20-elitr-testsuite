#!/usr/bin/env python3

import urllib.request
import json
import re
import argparse
import glob

def reverseAlign(alignment):
    return re.sub(r'(\d+)\-(\d+)', r'\2-\1', alignment)

def align(LANG1, LANG2, text1, text2):
    swap = (LANG1 == 'cs')
    if swap:
        LANG1, LANG2 = LANG2, LANG1

    data = {'src_text': text1, 'trg_text': text2}

    request = urllib.request.Request(
        url=f'https://quest.ms.mff.cuni.cz/ptakopet-mt380/align/{LANG1}-{LANG2}',
        method='POST',
        headers={'Content-Type': 'application/json'},
        data=bytes(json.dumps(data), encoding="utf-8")
    )

    with urllib.request.urlopen(request) as response:
        data = response.read().decode('utf-8')
        alignment = json.loads(data)['alignment']
        if swap:
            alignment = reverseAlign(alignment)
        return alignment

def alignLines(LANG1, LANG2, lines1, lines2):
    return [align(LANG1, LANG2, x[0], x[1]) for x in zip(lines1, lines2)]

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Aligns data.')
    parser.add_argument(
        'doc_dir', help='Path to the document dir containing also src.txt')
    args = parser.parse_known_args()[0]

    with open(f'{args.doc_dir}/src.txt', 'r') as f:
        srcLines = f.readlines()

    files = glob.glob(f'{args.doc_dir}/*.txt')

    for tgtFile in files:
        if tgtFile.endswith('src.txt'):
            continue
        print(f'Processing {tgtFile}')
        with open(tgtFile, 'r') as f:
            tgtLines = f.readlines()
        alignment = alignLines('cs', 'en', srcLines, tgtLines)
        with open(tgtFile + '.a', 'w') as f:
            f.writelines([x+'\n' for x in alignment])