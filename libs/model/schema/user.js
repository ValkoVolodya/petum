var Ajv = require('ajv');
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var config = require(libs + 'config');
var ajv = new Ajv(config.get('ajvConfig'));

 userRegister = {
  "type": "object",
  "required": ["name", "email", "password"],
  "properties": {
    "name": {"type": "string", "minLength": 4},
    "email": {"type": "string", "format": "email"},
    "password": {"type": "string", "minLength": 8}
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
