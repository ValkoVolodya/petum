var Ajv = require('ajv');
var ajv = new Ajv({ allErrors: true, verbose: true });

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
