import numpy as np
import mosestokenizer

def niceNameDoc(doc):
    mapping = {
        'brouke': 'Audit (en)',
        'broukc': 'Audit (cs)',
        'kufre':  'Lease (en)',
        'kufrc':  'Lease (cs)',
        'euroe':  'News (en)',
        'autoc':  'News (cs)',
    }
    return mapping[doc] if doc in mapping else doc

def niceNameModel(model):
    mapping = {
        'ref': 'Reference', 'PROMT_NMT': 'PROMT\\_NMT',
        'newstest2020-online-b.sgm': 'Online-B',
        'newstest2020-online-a.sgm': 'Online-A',
        'newstest2020-online-z.sgm': 'Online-Z'
    }
    return mapping[model] if model in mapping else model


def niceNamePhn(phn):
    mapping = {
        'grammar': 'Other grammar',
        'role': 'Semantic role',
        'style': 'Style',
        'disappearance': 'Disappearance',
        'conflict': 'Conflicting',
        'nontranslated': 'Non-translated',
        'inconsistency': 'Inconsistency',
        'terminology': 'Terminology',
        'tootranslated': 'Over-translated',
        'typography': 'Typography',
        'sense': 'Sense'
    }
    return mapping[phn] if phn in mapping else phn

PHNALL = ['disappearance', 'typography', 'sense', 'style', 'terminology',
          'inconsistency', 'nontranslated', 'conflict', 'grammar', 'role', 'tootranslated']


_tokenizers = {
    'cs': mosestokenizer.MosesTokenizer('cs'),
    'en': mosestokenizer.MosesTokenizer('en')
}

def tokenize(text, language):
    return _tokenizers[language](text)