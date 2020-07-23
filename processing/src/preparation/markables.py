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


def indicies(text, markables, sensitive=False):
    markableMap = {}
    for values in markables:
        head = values[0]

        for value in values:
        # Take markables which are not inside of another word
            if sensitive:
                occurences = re.finditer(f'(^|\W)({value})($|\W)', text)
                # second group boundaries group
                markableMap.setdefault(head, []).extend([(m.start(2), m.end(2)) for m in occurences])
            else:
                occurences = re.finditer(f'(^|\W)({value})($|\W)', text, re.IGNORECASE)
                # second group boundaries group
                markableMap.setdefault(head, []).extend([(m.start(2), m.end(2)) for m in occurences])

    markableMap = {k:v for k,v in markableMap.items() if len(v) != 0}
    # TODO: deduplicate
    return markableMap

def indicies_visible(text, markables, sensitive=False):
    return indicies(text, markables, sensitive).keys()