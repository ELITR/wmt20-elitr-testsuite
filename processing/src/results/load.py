#!/usr/bin/env python3

import json
import argparse
import glob, os
import re
from pathlib import Path
from utils import tokenize, PHNALL
import pandas as pd
import numpy as np
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction


def load_all(rating_dir):
    files = glob.glob(f'{rating_dir}/*.json')
    return load_files(files)

def replaceDoc(key, doc):
    if re.match(r'\w+e', key):
        # EN->CS only eTranslation
        def replaceLine(line):
            return {(k.replace('PROMT_NMT-eTranslation', 'eTranslation')): v for (k, v) in line.items()}
    elif re.match(r'\w+c', key):
        # CS->EN only PROMT_NMT
        def replaceLine(line):
            return {(k.replace('PROMT_NMT-eTranslation', 'PROMT_NMT')): v for (k, v) in line.items()}
    else:
        def replaceLine(line):
            return line
    return {k: replaceLine(v) for (k, v) in doc.items()}


def load_files(files):
    out = {}
    for file in files:
        name = Path(file).stem
        obj = json.load(open(file, 'r'))
        obj = {k: replaceDoc(k, v) for (k, v) in obj.items()}
        out[name] = obj
    return out


def get_lines(dir, doc, model, line):
    if model in {'PROMT_NMT', 'eTranslation'}:
        model = 'PROMT_NMT-eTranslation'
    with open(f'{dir}/{doc}/{model}.txt', 'r') as f:
        line_tgt = f.readlines()[line].rstrip('\n')
    with open(f'{dir}/{doc}/ref.txt', 'r') as f:
        line_ref = f.readlines()[line].rstrip('\n')
    return line_ref, line_tgt


def load_all_p1(add_bleu=False):
    print('Loading data')
    parser = argparse.ArgumentParser()
    parser.add_argument('--rating-dir', default='../data/p1/')
    parser.add_argument('--data-dir', default='./data/')
    args = parser.parse_known_args()[0]

    data = load_all(args.rating_dir)
    processed_data = []

    for (userName, userVal) in data.items():
        for (docName, docVal) in userVal.items():
            for (lineName, lineVal) in docVal.items():
                for (modelName, modelVal) in lineVal.items():
                    if modelName == 'time':
                        continue
                    lang = 'en' if docName.endswith('c') else 'cs'
                    txt_ref, txt_tgt = get_lines(
                        args.data_dir, docName, modelName, int(lineName))

                    errors = re.split(r'\W', modelVal.get('errors', ''))
                    errors = [x.lower() for x in errors if x != '' and len(x) >= 2]
                    errors = len(set(errors))
                    if docName in {'euroe', 'autoc'}:
                        domain = 'news'
                    elif docName in {'brouke', 'broukc'}:
                        domain = 'audit'
                    elif docName in {'kufre', 'kufrc'}:
                        domain = 'lease'
                    processed_data.append({
                        'user': userName,
                        'doc': docName,
                        'line': int(lineName),
                        'model': modelName,
                        'txt_ref': txt_ref,
                        'txt_tgt': txt_tgt,
                        'lang': lang,
                        'errors': errors,
                        'domain': domain,
                        'fluency':  float(modelVal.get('fluency', np.nan)),
                        'adequacy': float(modelVal.get('adequacy', np.nan))
                    })

    df = pd.DataFrame(processed_data)
    df['mult'] = df.apply(lambda row: row.fluency*row.adequacy, axis=1)

    if add_bleu:
        print('Computing BLEU')
        def comp_bleu(row):
            tok_ref = tokenize(row.txt_ref, row.lang)
            tok_tgt = tokenize(row.txt_tgt, row.lang)
            return 100*sentence_bleu([tok_ref], tok_tgt, smoothing_function=SmoothingFunction().method1)
        df['bleu'] = df.apply(comp_bleu, axis=1)

    return df


def load_all_p2(clear_badlines=False):
    print('Loading data')
    parser = argparse.ArgumentParser()
    parser.add_argument('--rating-dir', default='../data/p2/')
    parser.add_argument('--data-dir', default='./data/')
    args = parser.parse_known_args()[0]

    data = load_all(args.rating_dir)
    processed_data = []
    for (userName, userVal) in data.items():
        for (docMkbName, docVal) in userVal.items():
            docName, mkbName = docMkbName.split('-')
            for (lineKey, lineVal) in docVal.items():
                for (modelName, modelVal) in lineVal.items():
                    if modelName == 'time':
                        continue
                    processed_data.append({
                        **{
                            'user': userName,
                            'doc': docName,
                            'mkb': mkbName,
                            'model': modelName,
                            'lineKey': lineKey
                        },
                        **{k: float(v) for k, v in modelVal.items()}
                    })
    df = pd.DataFrame(processed_data)
    if clear_badlines:
        print('Removing bad lines')
        df = df[df.apply(lambda row: reasonable_line(df, row), axis=1)]
    return df

def reasonable_line(df, row):
    models = df[(df['lineKey'] == row.lineKey) & (df['mkb'] == row.mkb) & (df['user'] == row.user) & (df['doc'] == row.doc)]
    for phName in PHNALL:
        if models[phName].isna().sum() == 0:
            return False
    return True   