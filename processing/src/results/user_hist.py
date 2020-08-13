#!/usr/bin/env python3

import numpy as np
from utils import niceNameModel
from load import load_all_p1
import pandas as pd
import matplotlib.pyplot as plt

data = load_all_p1(add_bleu=False)[['user', 'fluency', 'adequacy']]
data['mult'] = data['fluency']*data['adequacy']
data = data.drop(['fluency', 'adequacy'], axis=1)

users = data.groupby('user')

for user in data['user'].unique():
    print(f'Showing user {user}')
    userdata = data[data['user'] == user]
    userdata.plot.hist()
    plt.title(user)
    # plt.show()
    plt.savefig('/home/vilda/tmp/' + user+ '.png')
