const Scheduler = require('.');

test('Keeps running the scheduled job', function (done) {
  const task = jest.fn().mockReturnValue(Promise.resolve(0.5));

  var s = new Scheduler(task);

  setTimeout(function () {
    s.stop();
    expect(task).toBeCalledTimes(3);
    done();
  }, 1100);
});

test('Resolves the promise when stopped.', function () {
  const task = jest.fn().mockReturnValue(Promise.resolve(0.5));

  var s = new Scheduler(task);

  return s.stop();
});
