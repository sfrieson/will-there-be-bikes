import numpy as np
import pandas as pd
from . import time_utils as time

desired_fields = [
  'last_reported',
  # 'num_bikes_available',
  'capacity',
  'day_of_week',
  'is_holiday',
  'season',
  'segment_of_day',
  'cloud_coverage',
  'condition',
  'condition_class',
  'humidity',
  'pressure',
  'rain',
  'snow',
  'temp',
  'wind_speed'
]

def flattenWeatherDict(data):
  weather = {
    'weather_time': data['dt'],
    'temp': data['main']['temp'],
    'pressure': data['main']['pressure'],
    'humidity': data['main']['humidity'] / 100,
    'cloud_coverage': data['clouds']['all'] / 100,
    'wind_speed': data['wind']['speed']
  }

  if isinstance(data['weather'], list):
    weather['condition'] = data['weather'][0]['id']
  else:
    weather['condition'] = data['weather']['id']

  weather['condition_class'] = weather['condition'] // 100
  try:
    weather['rain'] = data['rain']['3h']
  except KeyError:
    weather['rain'] = 0

  try:
    weather['snow'] = data['snow']['3h']
  except KeyError:
    weather['snow'] = 0

  return weather

def transform_time(data):
  return {
    'last_reported': data,
    'segment_of_day': time.segment_of_day(data),
    'day_of_week': time.day_of_week(data),
    'is_holiday': time.is_holiday(data),
    'season': time.season(data)
  }

def find_weather(weather, row):
  target_time = row['last_reported']

  try:
    weather_time = weather[weather.weather_time < target_time][-1:].iloc[0]['weather_time']
  except IndexError:
    weather_time = np.nan

  return weather_time

def remove_status_outliers(status):
  return status[status.last_reported > 1]

def transform_data(data):
  status, meta, weather = data
  status = pd.DataFrame(status)
  meta = pd.DataFrame(meta)

  status = remove_status_outliers(status)

  weather = pd.DataFrame([flattenWeatherDict(w) for w in weather.values()])
  # merge time data
  merged = pd.merge(
    status,
    pd.DataFrame(
      [transform_time(t) for t in status.last_reported.to_list()]
    ),
    on='last_reported'
  )

  merged = pd.merge(merged, meta, on='station_id')
  # add related weather_time
  merged['weather_time'] = merged.apply(lambda row: find_weather(weather, row), axis=1)

  # filter if no related weather
  merged = merged[pd.notnull(merged.weather_time)]

  merged = pd.merge(merged, weather, on='weather_time')

  merged['y'] = merged['num_bikes_available'] / merged['capacity']
  return merged[[*desired_fields, 'y']]

def get_keys():
  return {
    'season': time.seasons,
    'condition': [200,201,202,210,211,212,221,230,231,232,300,301,302,310,311,312,313,314,321,500,501,502,503,504,511,520,521,522,531,600,601,602,611,612,615,616,620,621,622,701,711,721,731,741,751,761,762,771,781,800,801,802,803,804],
    'condition_class': list(range(2, 9)),
    'is_holiday': [True, False],
    'day_of_week': list(range(7)),
    'segment_of_day': list(range(int(24 * 60 / 5))) # 5 minute chunks of a day
  }

def transform(data):
  data = transform_data(data)
  categories = get_keys()

  for category in categories.keys():
    data[category] = data[category].astype('category')
    data[category].cat.add_categories(
      [cat for cat in categories[category] if cat not in data[category].cat.categories]
    )

  return data
