from torch.utils.data import Dataset
import os
import json

class Data(Dataset):
  def __init__(self):
    self.station_files = os.listdir('./mock-s3/station-status')
    self.length = None
    with open('mock-s3/station-info.json', 'r') as station_info:
      self.station_info = json.load(station_info)

  def __len__(self):
    if self.length is None:
      self.length = 0
      for f in self.station_files:
        with open('mock-s3/station-status/' + f, 'r') as station:
          item = json.load(station)
          self.length += len(item['data']['stations'])

    return self.length

  def __getitem__(self, i):
    # Implement finding the correct index
    item = None
    with open('mock-s3/station-status/' + self.station_files[i], 'r') as station:
      item = json.load(station)

    with open('mock-s3/' + item['weatherFile'], 'r') as weather:
      item['weather'] = json.load(weather)

    item['info'] = self.station_info[item['station_id']]
    return item
