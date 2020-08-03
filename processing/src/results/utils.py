import numpy as np

def nicename(model):
    mapping = {
        'ref': 'Reference', 'PROMT_NMT': 'PROMT\\_NMT',
        'newstest2020-online-b.sgm': 'Online-B',
        'newstest2020-online-a.sgm': 'Online-A',
        'newstest2020-online-z.sgm': 'Online-Z'
    }
    return mapping[model] if model in mapping else model

def nicephn(phn):
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

def badline(phn, lineVal):
    return np.all([phn in tmpModelVal for key, tmpModelVal in lineVal.items() if key != 'time'])

modelBLEU = {
    'eTranslation': 0.3691897832532345,
    'CUNI-Transformer': 0.3472026636330126,
    'SRPOL': 0.3546712271356658,
    'Online-G': 0.2859323236822436,
    'zlabs-nlp': 0.26075427881625035,
    'CUNI-T2T-2018': 0.333755759265639,
    'CUNI-DocTransformer': 0.3585021115468853,
    'newstest2020-online-b.sgm': 0.37073245997262544,
    'OPPO': 0.35308716843303706,
    'UEDIN-CUNI': 0.3284552388267501,
    'newstest2020-online-z.sgm': 0.2667259413179943,
    'PROMT_NMT': 0.32099043296658347,
    'newstest2020-online-a.sgm': 0.31840133787298613,
}

modelBLEUr = dict(modelBLEU)
modelBLEUr['ref'] = 1

modelMULT = {
    'CUNI-DocTransformer': 0.8456153600550153,
    'OPPO': 0.8241745067841321,
    'CUNI-Transformer': 0.8147666789772411,
    'SRPOL': 0.8074354939441147,
    'eTranslation': 0.8064292029809271,
    'ref': 0.8035885506575161,
    'newstest2020-online-b.sgm': 0.7974307320227765,
    'CUNI-T2T-2018': 0.7908407189872708,
    'UEDIN-CUNI': 0.7721192617832585,
    'newstest2020-online-a.sgm': 0.7699497059441399,
    'PROMT_NMT': 0.7550903119868638,
    'newstest2020-online-z.sgm': 0.7087697009248733,
    'Online-G': 0.6921109637488948,
    'zlabs-nlp': 0.6167695921575232,
}