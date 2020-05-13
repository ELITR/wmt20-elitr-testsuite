#!/usr/bin/env python3

import yaml
import re
from collections import defaultdict

def inv_markable(markables):
    markablesInv = {}
    for code in markables:
        for values in markables[code]:
            markablesInv[values] = code
    return markablesInv


def annotate(text, markables, sensitive=False):
    markablesInv = inv_markable(markables)

    for value, code in markablesInv.items():
        if sensitive:
            text = re.sub(f'(^|[^>])({value})($|[^<])',
                          r'\1' + f'<m m=\'{code}\'>' + r'\2</m>\3', text)
        else:
            text = re.sub(f'(^|[^>])({value})($|[^<])', r'\1' +
                          f'<m m=\'{code}\'>' + r'\2</m>\3', text, flags=re.IGNORECASE)

    return text

def distribution(text, markables, sensitive=False):
    markablesInv = inv_markable(markables)

    dist = defaultdict(int)

    for value, code in markablesInv.items():
        if sensitive:
            dist[code] += text.count(value)
        else:
            dist[code] += text.lower().count(value.lower())

    return dist