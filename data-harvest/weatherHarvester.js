const https = require('https');

const AWS = require('aws-sdk');
const S3 = new AWS.S3();

const BUCKET = 'will-there-be-bikes-data';
const ENDPOINT = `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.OWMKEY}&id=`;

function writeObject (filename, data) {
  return new Promise(function (resolve, reject) {
    S3.putObject({
      Key: filename,
      Body: data,
      Bucket: BUCKET
    }, function (err, data) {
      if (err) {
        console.log(err);
        return reject(err);
      }
      resolve(data);
    });
  });
}

function get (url) {
  return new Promise(function (resolve, reject) {
    let data = '';

    https.get(url, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        resolve({
          statusCode: parseInt(res.statusCode, 10),
          data: JSON.parse(data)
        });
      });
    }).on('error', reject);
  });
}

exports.handler = async function (event, context) {
  try {
    const res = await get(ENDPOINT + event.stationId);
    if (res.statusCode === 200) {
      const timestamp = Math.floor(Date.now() / 1e3);
      const payload = JSON.stringify(res.data);
      var filename = `weather/${event.stationId}_${timestamp}.json`;
      await writeObject(filename, payload);
      await writeObject('current-weather.txt', filename);
    } else {
      throw new Error(`Request failed. Status code: ${res.statusCode}.\n${res.data}`);
    }
  } catch (e) {
    console.log(e);
  }
};
