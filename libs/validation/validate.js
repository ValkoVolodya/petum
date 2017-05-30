'use strict'


function validateRequiredExists (obj, props, callback) {
  return props.every((prop) => obj.hasOwnProperty(prop));
}

function validateFields (validateMethod, statuses, callback) {
  var valid = validateUser.register(req.body);
  if (!valid) {
    let statusForSend = status.WRONG_JSON;
    let errors = validateUser.register.errors;
    errors.forEach(function (item) {
      let prop = item.dataPath.substr(1);
      if (statuses.hasOwnProperty(prop)) {
        statusForSend = statuses[prop];
      }
    })
    var message = errors.reduce(function(res, item) {
      return res + item.message + '; ';
    }, '');
    callback(false, {
      status: statusForSend,
      message
    });
  }
  callback(true);
}


module.exports = {
  validateRequiredExists,
  validateFields
}
