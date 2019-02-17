const wait = require('.');

test('does not respond immediately', function () {
  let finished = false;
  const waiter = wait(0);
  waiter.over.then(() => { finished = true; });

  expect(finished).toBe(false);
});

test('finishes after supplied length of time in seconds', function (done) {
  let finished = false;
  const waiter = wait(1);
  waiter.over.then(() => { finished = true; });

  setTimeout(function () {
    expect(finished).toBe(true);
    done();
  }, 1001);
});

test('Resolves early if cancelled', function (done) {
  let finished = false;

  const waiter = wait(1);
  waiter.over.then(() => { finished = true; });

  waiter.cancel();

  setTimeout(function () {
    expect(finished).toBe(true);
    done();
  }, 500);
});
