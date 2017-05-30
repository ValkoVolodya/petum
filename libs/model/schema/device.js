var Ajv = require('ajv');
var log = require(libs + 'log')(module);
var config = require(libs + 'config');
var ajv = new Ajv(config.get('ajvConfig'));

deviceCreate = {
  "type": "object",
  "required": ["name", "deviceId"],
  "properties": {
    "name": {"type": "string", "minLength": 4},
    "deviceId": {"type": "string"},
  }
}

userLogin = {
 "type": "object",
 "required": ["email", "password"],
 "properties": {
   "email": {"type": "string", "minLength": 1},
   "password": {"type": "string", "minLength": 1}
 }
}

exports.register = ajv.compile(userRegister);
exports.login = ajv.compile(userLogin);
