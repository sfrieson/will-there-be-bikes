const bikes = require('.')();
const path = require('path');

const writeFile = require('../../util/writeFile');

const outDir = path.resolve(__dirname, '..', '..', '..', 'out', 'bikes');

module.exports = async function stationJob () {
  try {
    const res = await bikes.getStationStatus();
    var status = JSON.parse(res);
  } catch (e) {
    console.log('request failure');
    throw e;
  }

  const timestamp = status.last_updated;

  try {
    await writeFile(outDir, timestamp + '.json', JSON.stringify(status));
  } catch (e) {
    console.log('write file failure');
    throw e;
  }
};
