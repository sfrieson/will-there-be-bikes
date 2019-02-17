const path = require('path');

const OWM = require('.');
const CitiBike = require('../CitiBike')();
const Queue = require('../../util/queue');
const writeFile = require('../../util/writeFile');

const weather = new OWM({key: process.env.OWMKEY});
const baseOutDir = path.join(__dirname, '..', '..', '..', 'out', 'weather');

const stationList = new Queue();

module.exports = async function () {
  if (stationList.isEmpty()) {
    try {
      let res = await CitiBike.getStationList();
      res = JSON.parse(res);
      stationList.load(
        res.data.stations.map(({ station_id: id, lat, lon }) => ({ id, lat, lon }))
      );
    } catch (e) {
      console.log(e);
      throw new Error('Failed to request Citi Bike stations list.');
    }
  }

  const station = stationList.pop();

  try {
    var data = await weather.get(station);
    data = JSON.parse(data);
  } catch (e) {
    console.log(e);
    throw new Error('Failed to request Weather data.');
  }

  const time = Math.floor(Date.now() / 1e3);

  try {
    await writeFile(path.join(baseOutDir, station.station_id), time + '.json', JSON.stringify(data));
  } catch (e) {
    console.log(e);
    throw new Error('Failed to write weather file.');
  }
};
