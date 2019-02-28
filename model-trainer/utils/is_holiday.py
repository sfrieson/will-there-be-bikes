import holidays

holiday_set = holidays.CountryHoliday('US', prov=None, state='NY')

def is_holiday(date):
  return date in holiday_set
