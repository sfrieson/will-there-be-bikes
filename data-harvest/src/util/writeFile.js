const fs = require('fs');
const path = require('path');
const util = require('util');
const zlib = require('zlib');

const stat = util.promisify(fs.stat);
const writeFilePromise = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const gzip = util.promisify(zlib.gzip);

module.exports = async function writeFile (dir, filename, data) {
  try {
    await stat(dir);
  } catch (e) {
    await mkdir(dir);
  }
  const deflatedData = await gzip(data);
  await writeFilePromise(path.join(dir, filename + '.gzip'), deflatedData);
};
