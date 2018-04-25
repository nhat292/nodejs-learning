var crypto = require('crypto');
var config = require('./config');

var helpers = {};

helpers.hash = function(str) {
  if (typeof(str) == 'string' && str.length > 0) {
    return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
  } else {
    return false;
  }
};

helpers.parseJsonToObject = function(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};

module.exports = helpers;
