import numpy as np

def one_hot(value, length=None, values=None):
  if values is None:
    values = range(length)

  vector = np.zeros([1, len(values)])
  vector[0, values.index(value)] = 1

  return vector[0]
