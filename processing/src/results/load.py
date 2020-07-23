#!/usr/bin/env python3

import json
import argparse
import glob
import os
import re
from pathlib import Path

def load_single():
    parser = argparse.ArgumentParser(description='Loads ')
    parser.add_argument('rating_file', help='Path to the logged user JSONfile')
    args = parser.parse_known_args()[0]

    return list(load_files([args.rating_file]).values())[0]

def load_all():
    parser = argparse.ArgumentParser(description='Loads ')
    parser.add_argument(
        'rating_dir', help='Path to the logged user JSONfile directory')
    args = parser.parse_known_args()[0]

    files = glob.glob(f'{args.rating_dir}/*.json')
    return load_files(files)

def replaceDoc(key, doc):
    if re.match(r'\w+e', key):
        # EN->CS only eTranslation
        def replaceLine(line):
            return {(k.replace( 'PROMT_NMT-eTranslation', 'eTranslation')): v for (k, v) in line.items()}
    elif re.match(r'\w+c', key):
        # CS->EN only PROMT_NMT
        def replaceLine(line):
            return {(k.replace( 'PROMT_NMT-eTranslation', 'PROMT_NMT')): v for (k, v) in line.items()}
    else:
        def replaceLine(line):
            return line
    return {k: replaceLine(v) for (k, v) in doc.items()}

def load_files(files):
    out = {}
    for file in files:
        name = Path(file).stem
        obj = json.load(open(file, 'r'))
        obj = {k:replaceDoc(k, v) for (k, v) in obj.items()}
        out[name] = obj
    return out