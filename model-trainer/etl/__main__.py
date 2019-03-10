"""
The data munging portion of the repo.
"""
from export import export
from load import load
from transform import transform

print('ETL')

load(transform(export()))