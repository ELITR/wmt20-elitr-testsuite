#!/usr/bin/env python3

import urllib.request
import json
import re
import argparse
import glob
import mosestokenizer
import subprocess

def tokenize(text, language, join=True):
    """
    Tokenize text with mosestokenizer 
    """
    tokenize = mosestokenizer.MosesTokenizer(language)
    tokens = tokenize(text)
    tokenize.close()
    if join:
        tokens = ' '.join(tokens)
    return tokens

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Tokenizes data.')
    parser.add_argument(
        'doc_dir', help='Path to the document dir containing also src.txt')
    args = parser.parse_known_args()[0]

    with open(f'{args.doc_dir}/src.txt', 'r') as f:
        srcLines = f.readlines()


    files = glob.glob(f'{args.doc_dir}/*.txt')

    for tgtFile in files:
        LANG1 = 'cs'
        LANG2 = 'en'

        if tgtFile.endswith('src.txt'):
            LANG2 = LANG1

        print(f'Processing {tgtFile}')
        
        with open(tgtFile, 'r') as f:
            tgtLines = [x.rstrip('\n') for x in f.readlines()]
        
        tokenization = [tokenize(x, LANG2, True) for x in tgtLines]
            
        with open(tgtFile + '.tok', 'w') as f:
            f.writelines([x+'\n' for x in tokenization])