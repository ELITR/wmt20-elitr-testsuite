#!/usr/bin/env python3

import json
import argparse
import glob, os
from pathlib import Path

def load_single():
    parser = argparse.ArgumentParser(description='Loads ')
    parser.add_argument('rating_file', help='Path to the logged user JSONfile')
    args = parser.parse_known_args()[0]

    data = json.load(open(args.rating_file, 'r'))
    return data

def load_all():
    parser = argparse.ArgumentParser(description='Loads ')
    parser.add_argument('rating_dir', help='Path to the logged user JSONfile directory')
    args = parser.parse_known_args()[0]

    files = glob.glob(f'{args.rating_dir}/*.json')

    return load_files(files)

def load_files(files):
    out = {}
    for file in files:
        name = Path(file).stem
        out[name] = json.load(open(file, 'r'))
    return out