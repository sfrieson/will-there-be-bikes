const makeGet = require('.');
const defaultOptions = {
  get: makeGet()
};

module.exports = function makeRateLimitedRequest (limitLength, overrideOptions) {
  const { get } = Object.assign({}, defaultOptions, overrideOptions);

  let nextCall = 0;

  return function limiter (url) {
    return new Promise(function (resolve) {
      const wait = nextCall - Date.now();
      if (wait <= 0) {
        resolve(get(url));
        nextCall = Date.now() + limitLength;
      } else {
        setTimeout(function () {
          resolve(get(url));
          nextCall = Date.now() + limitLength;
        }, wait);
      }
    });
  };
};
