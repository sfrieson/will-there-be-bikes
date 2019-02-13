const makeRateLimitedRequest = require('./rate-limited');

const opts = {
  get: require('./get.test').mockGet
};

const mockGetResponseTime = 100;

test('resolves requets', () => {
  const limit = 200;
  const limiter = makeRateLimitedRequest(limit, opts);
  return limiter('limited-url');
});

test('delays chained requests within the rate limit range', done => {
  const limit = 200;
  const limiter = makeRateLimitedRequest(limit, opts);

  let res1 = false;
  let res2 = false;

  limiter('limited-url').then(() => { res1 = true; });
  limiter('limited-url').then(() => { res2 = true; });

  setTimeout(function () {
    expect(res1).toEqual(true);
    expect(res2).toEqual(false);
  }, mockGetResponseTime + 10);

  setTimeout(function () {
    expect(res1).toEqual(true);
    expect(res2).toEqual(true);
    done();
  }, limit + mockGetResponseTime + 150);
});

test('delays chained requests within the rate limit range', done => {
  const limit = 200;
  const limiter = makeRateLimitedRequest(limit, opts);

  let res1 = false;
  let res2 = false;

  limiter('limited-url').then(() => { res1 = true; })
    .then(() => limiter('limited-url').then(() => { res2 = true; }));

  setTimeout(function () {
    expect(res1).toEqual(true);
    expect(res2).toEqual(false);
  }, mockGetResponseTime + 10);

  setTimeout(function () {
    expect(res1).toEqual(true);
    expect(res2).toEqual(true);
    done();
  }, limit + mockGetResponseTime + 150);
});

test('allows immediate requests outside of the rate limit range', done => {
  const limit = 200;
  const limiter = makeRateLimitedRequest(limit, opts);

  let res1 = false;
  let res2 = false;

  limiter('limited-url').then(() => { res1 = true; });
  setTimeout(function () {
    limiter('limited-url').then(() => { res2 = true; });
    setTimeout(function () {
      expect(res1).toEqual(true);
      expect(res2).toEqual(true);
      done();
    }, mockGetResponseTime + 1100);
  }, limit + 1100);
});
