const defaultOptions = {
  https: require('https')
};

module.exports = function makeGet (optionOverwrites = {}) {
  const {
    https
  } = Object.assign({}, defaultOptions, optionOverwrites);

  return function get (url) {
    return new Promise(function (resolve, reject) {
      let data = '';

      https.get(url, function (res) {
        const status = parseInt(res.status, 10);
        if (status >= 300) return resolve(status);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          data += chunk;
        });
        res.on('end', function () {
          resolve(data);
        });
      }).on('error', reject);
    });
  };
};
