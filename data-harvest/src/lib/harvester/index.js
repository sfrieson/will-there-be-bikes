const https = require('https');

function request (url) {
  return new Promise(function (resolve, reject) {
    let data = '';
    const req = https.request(url, function (res) {
      const status = parseInt(res.status, 10);
      if (status >= 300) return resolve(status);
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        resolve(data);
      });
    });

    req.on('error', reject);
  });
}

module.exports = async function harvest (endpoint, outdir, calculateWait) {
  // get data
  const res = await request(endpoint);
  console.log(res);
  // parse timestamp for outfile
  // write outfile to outdir

  // parse TTL
  const ttl = 1;

  return ttl;
};
