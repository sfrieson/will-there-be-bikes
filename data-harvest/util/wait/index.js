module.exports = function Wait (seconds) {
  let timeout;
  let resolveFromPromise;
  return {
    over: new Promise((resolve) => {
      resolveFromPromise = resolve;
      timeout = setTimeout(resolve, seconds * 1000);
    }),
    cancel: () => {
      clearTimeout(timeout);
      resolveFromPromise();
    }
  };
};
