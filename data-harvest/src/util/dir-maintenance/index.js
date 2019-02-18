const fs = require('fs');
const path = require('path');
const util = require('util');

const timestamp = require('../timestamp');

const readdir = util.promisify(fs.readdir);
const rename = util.promisify(fs.rename);

/*
  Create the folders necessary to run the jobs.
  runs synchronously to ensure directory availability for other jobs.
*/

function mkdir (path) {
  try {
    fs.statSync(path);
  } catch (e) {
    fs.mkdirSync(path);
  }
}

const root = path.join(__dirname, '..', '..', '..');
function setup () {
  mkdir(path.join(root, 'outbox'));
  mkdir(path.join(root, 'out'));
  mkdir(path.join(root, 'out', 'bikes'));
  mkdir(path.join(root, 'out', 'weather'));
}

module.exports.setup = setup;

module.exports.rotate = function () {
  // check root size // How to do this properly?
  // if over 300mb zip:
  fs.renameSync(path.join(root, 'out'), path.join(root, 'tmp'));
  // mkdir
  setup();

  return readdir(path.join(root, 'tmp'))
    // .then(zip) // use archiver to zip the directory
    .then(function () {
      return rename(path.join(root, 'tmp'), path.join(root, 'outbox', timestamp() + '.gzip'));
    })
    .catch(console.log);
};
