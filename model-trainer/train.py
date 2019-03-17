from torch.utils.data import Dataset, DataLoader, random_split
import pandas as pd
from sklearn import preprocessing
import torch.nn.functional as F
import torch.nn as nn
import etl

class BikesData (Dataset):
  def __init__(self, df):
    self.data = df.drop(columns=['y'])
    self.labels = df.y

  def __len__(self):
    return len(self.data)

  def __getitem__(self, idx):
    return self.data[idx], self.labels[idx]

def split_data(data, train=0.8, valid=None, test=None):
  if valid is None:
    valid = 1.0 - train

  length = len(data)
  split = [round(length * train), round(length * valid)]

  if test is not None:
    split.append(round(length * test))

  return random_split(data, split)

# This should  be called every time because the data mean, min, max, etc will change as more comes in (at least for a full year)
def get_numerical_scaler(data):
  return preprocessing.StandardScaler().fit(data)

def split_features(data):
  categorical_features = [name for name in data.columns if isinstance(data[name].dtype, pd.api.types.CategoricalDtype)]
  numerical_features = [name for name in data.columns if name not in categorical_features]

  # 1-index the categories
  for cat in categorical_features:
    data[cat] = data[cat].cat.codes + 1

  return categorical_features, numerical_features

class Model(nn.Module):
  def __init__(self):
    super().__init__()
    pass

  def forward(self):
    pass

def fit(model, train_dataloader, valid_datalodater, loss, optim, epochs=10, pre_scheduler=None, post_scheduler=None):
  return model

df = etl.go()

cat_features, num_features = split_features(df.drop(columns=['y']))
print(cat_features, num_features)

dataset = BikesData(df)
train_dataset, validation_dataset = split_data(dataset, train=.8)

model = fit(
  Model(),
  DataLoader(train_dataset, batch_size=16),
  DataLoader(validation_dataset, batch_size=16),
  F.cross_entropy,
  None
)