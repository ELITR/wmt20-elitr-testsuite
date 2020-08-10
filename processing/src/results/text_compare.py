#!/usr/bin/env python3

import numpy as np
from utils import niceNameModel, niceNamePhn, PHNALL
from load import load_all_p1, load_all_p2
import pandas as pd


pd.options.display.max_rows = 70
pd.options.display.max_colwidth = 50

data = load_all_p2(clear_badlines=True, add_bleu=True)
dataP1 = load_all_p1()
data['sev'] = data.apply(lambda row: sum([0 if np.isnan(row[phnName]) else row[phnName] for phnName in PHNALL]), axis=1)