var Scheduler = require('./');

test('Keeps running the scheduled job', function (done) {
  const mock = jest.fn().mockReturnValue(0.5);

  var s = new Scheduler(mock);

  setTimeout(function () {
    s.stop();
    expect(mock).toBeCalledTimes(3);
    done();
  }, 1100);
});

test('Resolves the promise when stopped.', function () {
  const mock = jest.fn().mockReturnValue(0.5);

  var s = new Scheduler(mock);

  return s.stop();
});
