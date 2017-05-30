'use strict'

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var status = require(libs + 'routes/statuses');

function validateRequiredExists (obj, props, callback) {
  return props.every((prop) => obj.hasOwnProperty(prop));
};

function validateFields (obj, validateMethod) {
  var valid = validateMethod(obj);
  if (!valid){
    return validateMethod.errors;
  }
  return null;
};

function makeValidationResponse (errors, statuses) {
  if (!errors || !statuses) {
    return {};
  }

  let statusForSend = status.WRONG_JSON;
  errors.forEach(function (item) {
    let prop = item.dataPath.substr(1);
    if (statuses.hasOwnProperty(prop)) {
      statusForSend = statuses[prop];
    }
  })
  var message = errors.reduce(function(res, item) {
    return res + item.message + '; ';
  }, '');
  return {
    status: statusForSend,
    message
  };
};


module.exports = {
  validateRequiredExists,
  validateFields,
  makeValidationResponse
}
