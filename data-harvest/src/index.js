const Job = require('./lib/Job');
const CitiBikeJob = require('./api/CitiBike/job');
const OWMJob = require('./api/OpenWeatherMap/job');
const dirMaintenance = require('./util/dir-maintenance');

dirMaintenance.setup();

const jobs = [];

jobs.push(new Job({
  name: 'directory maintenance',
  process: dirMaintenance.rotate,
  frequency: 6000000, // 1hr
  runImmediately: false
}));

jobs.push(new Job({
  name: 'stations',
  process: CitiBikeJob,
  frequency: 10000 // 10s
}));

jobs.push(new Job({
  name: 'weather',
  process: OWMJob,
  frequency: 1000, // 1s
  wait: true // wait for previous job to complete
}));

process.on('SIGTERM', function () {
  console.log('Heard SIGTERM');
  Promise.all(jobs.map(job => job.stop()))
    .then(function () {
      process.exit(0);
    });
});

let sigint = false;
process.on('SIGINT', function () {
  console.log('Heard SIGINT');
  if (sigint) process.exit(0);
  else sigint = true;
  Promise.all(jobs.map(job => job.stop()))
    .then(function () {
      const used = process.memoryUsage();
      for (let key in used) {
        console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
      }
      process.exit(0);
    });
});
