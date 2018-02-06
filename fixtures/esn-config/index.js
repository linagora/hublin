/*eslint no-console: 0 */

const fs = require('fs');
const mongoose = require('mongoose');

require('../../backend/core/index');

module.exports = done => {
  console.log('[INFO] Hublin Configuration');
  loadDirectory(__dirname + '/data', done);
};

function loadDirectory(name, done) {
  fs.readdirSync(name).forEach(filename => {
    const stat = fs.statSync(name + '/' + filename);

    if (stat.isFile()) {
      loadFile(filename, err => {
        if (err) {
          console.log('[ERROR] ' + filename + ' has not been loaded (' + err.message + ')');
        } else {
          console.log('[INFO] ' + filename + ' has been loaded');
        }
        done();
      });
    }
  });
}

function loadFile(name, done) {
  console.log('[INFO] Loading file', name);
  let data;

  try {
    data = require(`./data/${name}`)();
  } catch (err) {
    done(err);
  }

  try {
    const esnconfig = require('../../backend/core/esn-config')(name.slice(0, name.lastIndexOf('.')));

    mongoose.connection.on('connected', () => esnconfig.store(data, done));
  } catch (err) {
    done(err);
  }
}
