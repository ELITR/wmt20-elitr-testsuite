def nicename(model):
    mapping = {
        'ref': 'Reference', 'PROMT_NMT': 'PROMT\\_NMT',
        'newstest2020-online-b.sgm': 'Online-B',
        'newstest2020-online-a.sgm': 'Online-A',
        'newstest2020-online-z.sgm': 'Online-Z'
    }
    return mapping[model] if model in mapping else model