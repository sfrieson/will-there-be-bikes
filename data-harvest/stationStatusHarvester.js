const https = require('https');

const AWS = require('aws-sdk');
const S3 = new AWS.S3();

const BUCKET = 'will-there-be-bikes-data';
const ENDPOINT = 'https://gbfs.citibikenyc.com/gbfs/en/station_status.json';

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
function get (url, text) {
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
          data: text ? data : JSON.parse(data)
        });
      });
    }).on('error', reject);
  });
}

exports.handler = async function (event, context) {
  try {
    const [res, weatherFile] = await Promise.all([get(ENDPOINT), get('s3://will-there-be-bikes-data/current-weather.txt', true)]);
    if (res.statusCode === 200) {
      const payload = JSON.stringify(res.data);
      payload.weatherFile = weatherFile;

      const filename = `station-status/${res.data.last_updated}.json`;
      return writeObject(filename, payload);
    } else {
      throw new Error(`Request failed. Status code: ${res.statusCode}.\n${res.data}`);
    }
  } catch (e) {
    console.log(e);
  }
};
