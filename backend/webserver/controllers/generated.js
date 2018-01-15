const Q = require('q');
const ejs = require('ejs');
const config = require('../../core/config')('default');

module.exports = () => ({
  constants
});

function constants(req, res) {
  Q.ninvoke(ejs, 'renderFile', 'templates/js/constants.ejs', { getConfigurationConstant: getConfigurationConstant(config) })
    .then(file => res.status(200).send(file), err => res.status(500).send('Failed to generate constants file. ' + err));
}

function getConfigurationConstant(config) {
  return (group, key, defaultValue) => {
    if (config && typeof config[group] !== 'undefined' && typeof config[group][key] !== 'undefined') {
      return config[group][key];
    }

    return defaultValue;
  };
}
