import json
import numpy as np
import os
from torch.utils.data import Dataset
from utils import time
from utils.one_hot import one_hot

# https://openweathermap.org/weather-conditions
weather_condition_codes = [200,201,202,210,211,212,221,230,231,232,300,301,302,310,311,312,313,314,321,500,501,502,503,504,511,520,521,522,531,600,601,602,611,612,615,616,620,621,622,701,711,721,731,741,751,761,762,771,781,800,801,802,803,804]

def prepare(item):
  """
  Takes a merged data item from the dataset and prepares it for training.
  Removes unnecessary fields. Calculates label.
  returns (data, label)
  """

  y = item['num_bikes_available'] / item['info']['capacity']
  w = item['weather']
  if isinstance(w['weather'], list):
    weather_condition = w['weather'][0]
  else:
    weather_condition = w['weather']

  try:
    rain = w['rain']['3h']
  except KeyError:
    rain = 0

  try:
    snow = w['snow']['3h']
  except KeyError:
    snow = 0

  data = np.array([
    *one_hot(weather_condition['id'], values=weather_condition_codes),
    weather_condition['id'] // 100, # weather condition class
    w['main']['temp'],
    w['main']['pressure'],
    w['main']['humidity'] / 100,
    w['clouds']['all'] / 100,
    w['wind']['speed'],
    rain,
    snow,
    *time.day_of_week(item['time']),
    1 if time.is_holiday(item['time']) else -1,
    *one_hot(time.season(item['time']), values=time.seasons),
    item['info']['capacity']
    # TK neighborhood
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