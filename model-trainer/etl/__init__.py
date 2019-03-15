"""
The data munging portion of the repo.
"""
from etl.export import export
from etl.load import load
from etl.transform import transform

def go ():
  return transform(export())
