const makeGet = require('.');

const httpMock = {
  get: (url, getCallback) => {
    const res = {
      on: (msg, onCallback) => {
        if (msg === 'data') {
          setTimeout(() => onCallback('data'), 50);
        }
        if (msg === 'end') {
          setTimeout(() => onCallback(), 100);
        }
      },
      setEncoding: () => {},
      status: '200'
    };

    getCallback(res);

    return {
      on: () => {}
    };
  }
};

test('it returns a promise', function () {
  const get = makeGet({https: httpMock});
  expect(get('url').constructor).toBe(Promise);
});

test('it resolves to the data returned', function () {
  const get = makeGet({https: httpMock});
  expect(get('url')).resolves.toEqual('data');
});

test('it resolves', function () {
  const get = makeGet({https: httpMock});
  return get('url');
});

module.exports.mockGet = makeGet({https: httpMock});
