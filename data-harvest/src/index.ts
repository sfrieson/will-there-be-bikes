import Scheduler from './lib/scheduler';

const schedule = new Scheduler(function doSomething () {
  console.log('something');

  return Promise.resolve(3);
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
