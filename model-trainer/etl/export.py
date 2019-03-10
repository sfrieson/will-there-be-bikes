import os
import json

def get_station_status():
  filenames = os.listdir('./mock-s3/station-status')
  stationsJSON = []

  for f in filenames:
    filepath = './mock-s3/station-status/' + f
    with open(filepath, 'r') as station:
      item = json.load(station)
      stationsJSON += item['data']['stations']

  return stationsJSON

def get_station_meta():
  with open('./mock-s3/station-info.json', 'r') as info:
    res = json.load(info)
    # station_meta = {s['station_id']: s for s in json.load(info)['data']['stations']}
    station_meta = res['data']['stations']

  return station_meta

def get_weather():
  filenames = os.listdir('./mock-s3/weather')
  weatherJSON = {}
  for f in filenames:
    path = 'weather/' + f
    with open('./mock-s3/' + path, 'r') as weather:
      weatherJSON[path] = json.load(weather)

  return weatherJSON

def export ():
  return (get_station_status(), get_station_meta(), get_weather())