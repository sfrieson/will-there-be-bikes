const https = require('https');
const fs = require('fs');
const path = require('path');
const util = require('util');
const zlib = require('zlib');

const stat = util.promisify(fs.stat);
const writeFilePromise = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const gzip = util.promisify(zlib.gzip);

const writeFile = async function (dir, filename, data) {
  try {
    await stat(dir);
  } catch (e) {
    await mkdir(dir);
  }
  const deflatedData = await gzip(data);
  await writeFilePromise(path.join(dir, filename + '.gzip'), deflatedData);
};

function request (url) {
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
}

module.exports = async function harvest (endpoint, outdir) {
  try {
    var res = await request(endpoint);
  } catch (e) {
    console.log('request failure');
    throw e;
  }

  const resJson = JSON.parse(res);

  const timestamp = resJson.last_updated;

  try {
    await writeFile(outdir, timestamp + '.json', res);
  } catch (e) {
    console.log('write file failure');
    throw e;
  }

  const ttl = resJson.ttl;

  return ttl;
};
