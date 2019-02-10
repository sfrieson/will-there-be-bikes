const path = require('path');
const Scheduler = require('./lib/scheduler');
const harvester = require('./lib/harvester');

const schedule = new Scheduler(function doSomething () {
  console.log('task');

  return harvester('https://gbfs.citibikenyc.com/gbfs/en/station_status.json', path.join(__dirname, 'out'));
});

process.on('SIGTERM', function () {
  console.log('Heard SIGTERM');
  schedule.stop().then(function () {
    process.exit(0);
  });
});

process.on('SIGINT', function () {
  console.log('Heard SIGINT');
  schedule.stop().then(function () {
    process.exit(0);
  });
});
