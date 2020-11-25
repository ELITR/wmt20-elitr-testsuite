#!/usr/bin/env python3

import numpy as np
import pandas as pd
from load import load_all_p1, load_all_p2
from utils import niceNameModel, niceNamePhn, PHNALL

data = load_all_p2(clear_badlines=True)
print(data.head())