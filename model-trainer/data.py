import json
import numpy as np
import os
from torch.utils.data import Dataset

def get_day_of_week (time):
  one_day = 24 * 60 * 60
  four_days = 4 * one_day
  seven_days = 7 * one_day

  day_index = ((time - time % one_day) + four_days) % seven_days / one_day
  days = np.zeros([1, 7])
  days[0, int(day_index)] = 1.

  return days[0]

def prepare(item):
  """
  Takes a merged data item from the dataset and prepares it for training.
  Removes unnecessary fields. Calculates label.
  returns (data, label)
  """

  y = item['num_bikes_available'] / item['info']['capacity']
  w = item['weather']
  data = np.array([
    # w['weather']['id], # TK one-hot encoded
    w['main']['temp'],
    w['main']['pressure'],
    w['main']['humidity'] / 100,
    w['clouds']['all'] / 100,
    w['wind']['speed'],
    # w['rain']['3h'], or 0
    # w['snow']['3h'], or 0
    *get_day_of_week(item['time']),
    item['info']['capacity']
  ])

  return data, y

class Data(Dataset):
  def __init__(self):
    self.station_files = os.listdir('./mock-s3/station-status')
    self.length = 0
    self.station_file_meta = {}

    with open('mock-s3/station-info.json', 'r') as station_info:
      self.station_info = {s['station_id']: s for s in json.load(station_info)['data']['stations']}

    for f in self.station_files:
        filename = 'mock-s3/station-status/' + f
        with open(filename, 'r') as station:
          item = json.load(station)
          self.length += len(item['data']['stations'])

          self.station_file_meta[filename] = {'length': len(item['data']['stations'])}

  def __len__(self):
    return self.length

  def __getitem__(self, index):
    item = None
    for filename, meta in self.station_file_meta.items():
      if index > meta['length']:
        index -= meta['length']
      else:
        break

    with open(filename, 'r') as station_status:
      item_meta = json.load(station_status)
      item = item_meta['data']['stations'][index]

    with open('mock-s3/' + item_meta['weatherFile'], 'r') as weather:
      item['weather'] = json.load(weather)

    item['info'] = self.station_info[item['station_id']]
    item['time'] = item_meta['last_updated']
    return prepare(item)

if __name__ == "__main__":
  d = Data()
  print(len(d))
  print(d[0])