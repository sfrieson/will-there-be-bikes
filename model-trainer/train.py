# Reference: https://nbviewer.jupyter.org/github/FraPochetti/KagglePlaygrounds/blob/master/NYC%20Taxi%20Fares%20Prediction.ipynb
from collections import defaultdict
from torch.utils.data import Dataset, DataLoader, random_split
import pandas as pd
import numpy as np
from sklearn import preprocessing
from sklearn.metrics import mean_squared_error
import torch.nn.functional as F
import torch.nn as nn
import torch
import etl

class BikesData (Dataset):
    def __init__(self, df, cat_features, num_features):
        self.data = df.drop(columns=['y'])
        self.labels = df.y

        self._cat_features = cat_features
        self._num_features = num_features

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        return self.data[idx][self._cat_features], self.data[idx][self._num_features], self.labels[idx]


def split_data(data, train=0.8, valid=None, test=None):
    if valid is None:
        valid = 1.0 - train

    length = len(data)
    split = [round(length * train), round(length * valid)]

    if test is not None:
        split.append(round(length * test))

    return random_split(data, split)

def inv_y(y): return np.exp(y)

def rmse(targ, y_pred):
    return np.sqrt(mean_squared_error(inv_y(y_pred), inv_y(targ)))

def get_numerical_scaler(data):
    # This should  be called every time because the data mean, min, max, etc will change as more comes in (at least for a full year)
    return preprocessing.StandardScaler().fit(data)


def scale_numerical_features(df, columns, scaler):
    index = df.index
    scaled = scaler.transform(df[columns])
    scaled = pd.DataFrame(scaled, columns=columns, index=index)
    return pd.concat([scaled, df.drop(columns, axis=1)], axis=1)


def split_features(data):
    categorical_features = [name for name in data.columns if isinstance(
        data[name].dtype, pd.api.types.CategoricalDtype)]
    numerical_features = [
        name for name in data.columns if name not in categorical_features]

    # 1-index the categories
    for cat in categorical_features:
        data[cat] = data[cat].cat.codes + 1

    return categorical_features, numerical_features


class Model(nn.Module):
    def __init__(self, hidden_layers, dropout, emb_dropout, embedding_sizes, num_numerical_features, out_size, lr):
        super().__init__()
        self.embeddings = nn.ModuleList([nn.Embedding(
            cardinality_count, emb_size) for cardinality_count, emb_size in embedding_sizes])
        for emb in self.embeddings:
            nn.init.kaiming_uniform_(emb.weight.data)

        self.num_embeddings = sum(emb.embedding_dim for emb in self.embeddings)
        self.num_numerical = num_numerical_features

        sizes = [self.num_embeddings + self.num_numerical] + hidden_layers

        self.fc_layers = nn.ModuleList(
            [nn.Linear(sizes[i], sizes[i+1]) for i in range(len(sizes)-1)])
        self.batch_norms = nn.ModuleList(
            [nn.BatchNorm1d(size) for size in sizes[1:]])
        for lin in self.fc_layers:
            nn.init.kaiming_normal_(lin.weight.data)

        self.output = nn.Linear(sizes[-1], out_size)
        nn.init.kaiming_normal_(self.output.weight.data)

        if not isinstance(dropout, list):
            dropout = [dropout] * len(sizes)
        self.embedding_dropout = nn.Dropout(emb_dropout)
        self.drops = nn.ModuleList([nn.Dropout(d) for d in dropout])
        self.batch_norm = nn.BatchNorm1d(num_numerical_features)
        self.y_range = (0, 1)

    def forward(self, x_cat, x_cont):
        # embeddings for categorical features
        x = [emb(x_cat[:, i]) for i, emb in enumerate(self.embeddings)]
        x = torch.cat(x, 1)
        x = self.embedding_dropout(x)

        # numerical features
        x2 = self.batch_norm(x_cont)
        x = torch.cat([x, x2], 1)
        for l, d, b in zip(self.fc_layers, self.dropout, self.batch_norms):
            x = F.relu(l(x))
            x = b(x)
            x = d(x)
        x = self.output(x)
        if self.y_range:
            x = torch.sigmoid(x)
            x = x*(self.y_range[1] - self.y_range[0])
            x = x+self.y_range[0]
        return x.squeeze()

lr = defaultdict(list)
tloss = defaultdict(list)
vloss = defaultdict(list)

def fit(model, train_dataloader, valid_datalodater, loss_fn, optim, epochs=10, pre_scheduler=None, post_scheduler=None):
    for epoch in range(epochs):
        y_true_train = list()
        y_pred_train = list()
        total_loss_train = 0

        for cat, cont, y in train_dataloader:
            cat = cat.cuda()
            cont = cont.cuda()
            y = y.cuda()

            optim.zero_grad()
            pred = model(cat, cont)
            loss = loss_fn(pred, y)
            loss.backward()
            lr[epoch].append(optim.param_groups[0]['lr'])
            tloss[epoch].append(loss.item())
            post_scheduler.step()
            optim.step()

            y_true_train += list(y.data.numpy())
            y_pred_train += list(pred.data.numpy())
            total_loss_train += loss.item()

        train_acc = rmse(y_true_train, y_pred_train)
        train_loss = total_loss_train/len(train_dataloader)

        if valid_datalodater:
            y_true_val = list()
            y_pred_val = list()
            total_loss_val = 0
            for cat, cont, y in valid_datalodater:
                cat = cat.cuda()
                cont = cont.cuda()
                y = y.cuda()
                pred = model(cat, cont)
                loss = loss_fn(pred, y)

                y_true_val += list(y.data.numpy())
                y_pred_val += list(pred.data.numpy())
                total_loss_val += loss.item()
                vloss[epoch].append(loss.item())
            valacc = rmse(y_true_val, y_pred_val)
            valloss = total_loss_val/len(loss)
            print(
                f'Epoch {epoch}: train_loss: {train_loss:.4f} train_rmse: {train_acc:.4f} | val_loss: {valloss:.4f} val_rmse: {valacc:.4f}')
        else:
            print(
                f'Epoch {epoch}: train_loss: {train_loss:.4f} train_rmse: {train_acc:.4f}')

    return model, lr, tloss, vloss


df = etl.go()

cat_features, num_features = split_features(df.drop(columns=['y']))
print(cat_features, num_features)

scaler = get_numerical_scaler(df[num_features])
df = scale_numerical_features(df, num_features, scaler)

dataset = BikesData(df, cat_features, num_features)
train_dataset, validation_dataset = split_data(dataset, train=.8)

embeds = [
    (len(df[col].cat.categories), min(50, (len(df[col].cat.categories) + 1) // 2))
  for col in cat_features
]

model = Model(
    hidden_layers=[9, 9, 9],
    embedding_sizes=embeds,
    num_numerical_features=len(num_features),
    dropout=0.2,
    emb_dropout=0.2,
    out_size=1
)
print(model)
model = fit(
    model,
    DataLoader(train_dataset, batch_size=16),
    DataLoader(validation_dataset, batch_size=16),
    F.cross_entropy,
    torch.optim.Adam(model.parameters(), 1e-2)
)
