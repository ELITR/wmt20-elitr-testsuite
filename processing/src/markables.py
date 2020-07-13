#!/usr/bin/env python3

import yaml
import re
from collections import defaultdict

def inv_markable(markables):
    markablesInv = {}
    for mkb_array in markables:
        for value in mkb_array:
            markablesInv[value] = mkb_array[0]
    return markablesInv


def annotate(text, markables, sensitive=False):
    markablesInv = inv_markable(markables)

    for value, code in markablesInv.items():
        # Substitue markables which are not inside of another word
        if sensitive:
            text = re.sub(f'(^|[^>a-zA-Z])({value})($|[^<a-zA-Z])',
                          r'\1' + f'<m m=\'{code}\'>' + r'\2</m>\3', text)
        else:
            text = re.sub(f'(^|[^>a-zA-Z])({value})($|[^<a-zA-Z])', r'\1' +
                          f'<m m=\'{code}\'>' + r'\2</m>\3', text, flags=re.IGNORECASE)

    return text

def occurences_context(hay, value, sensitive=False):
    if sensitive:
        return len(re.findall(f'(^|[^>a-zA-Z])({value})($|[^<a-zA-Z])', hay))
    else:
        return len(re.findall(f'(^|[^>a-zA-Z])({value})($|[^<a-zA-Z])', hay, flags=re.IGNORECASE))

def distribution(text, markables, sensitive=False):
    markablesInv = inv_markable(markables)
    dist = defaultdict(int)

    for value, code in markablesInv.items():
        if sensitive:
            dist[code] += occurences_context(text, value, True)
        else:
            dist[code] += occurences_context(text, value, False)
    
    return dist