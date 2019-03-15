from torch.utils.data import Dataset, DataLoader, random_split
import pandas as pd
import torch.nn.functional as F
import torch.nn as nn
import etl

class BikesData (Dataset):
  def __init__(self, data):
    self.__store = data

  def __len__(self):
    return len(self.__store)

  def __getitem__(self, idx):
    return self.__store[idx]

data = etl.go()
dataset = BikesData(data)

def split_data(data, train=0.8, valid=None, test=None):
  if valid is None:
    valid = 1.0 - train

  if test is None:
    test = 0.0

  length = len(data)
  return random_split(
    data,
    [
      round(length * train),
      round(length * valid),
      round(length * test)
    ]
  )

def split_features(data):
  categorical_features = [name for name in data.columns if isinstance(data[name].dtype, pd.api.types.CategoricalDtype)]
  numerical_features = [name for name in data.columsn is name not in categorical_features]

  # 1-index the categories
  for cat in categorical_features:
    data[cat] = data[cat].cat.codes + 1

  return categorical_features, numerical_features

train_dataset, validation_dataset = split_data(dataset, train=.8)

train_loader = DataLoader(train_dataset, batch_size=16)
validation_loader = DataLoader(validation_dataset, batch_size=16)

loss_func = F.cross_entropy

class Model(nn.Module):
  def __init__(self):
    super().__init__()
    pass

  def forward(self):
    pass
