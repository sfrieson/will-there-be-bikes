from utils.one_hot import one_hot
from datetime import datetime

import holidays

holiday_set = holidays.CountryHoliday('US', prov=None, state='NY')

def is_holiday(date):
  return date in holiday_set

one_day = 24 * 60 * 60
def day_of_week (time):
  four_days = 4 * one_day
  seven_days = 7 * one_day

  day_index = int(((time - time % one_day) + four_days) % seven_days / one_day)

  return one_hot(day_index, length=7)

def day_of_year (time):
  return datetime.utcfromtimestamp(time).timetuple().tm_yday

seasons = ['winter', 'sprint', 'summer', 'autumn']
def season (time):
  day = day_of_year(time)

  if day < 81:
    return 'winter'
  if day < 173:
    return 'spring'
  if day < 265:
    return 'summer'
  if day < 356:
    return 'fall'
  return 'winter'