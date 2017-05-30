var Ajv = require('ajv');
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var config = require(libs + 'config');
var ajv = new Ajv(config.get('ajvConfig'));

deviceCreate = {
  "type": "object",
  "required": ["name", "deviceId"],
  "properties": {
    "name": {"type": "string", "minLength": 4},
    "deviceId": {"type": "string", "minLength": 4},
  }
};

deviceDelete = {
  "type": "object",
  "required": ["deviceId"],
  "properties": {
    "deviceId": {"type": "string", "minLength": 4}
  }
};

deviceRename = {
  "type": "object",
  "required": ["name", "deviceId"],
  "properties": {
    "name": {"type": "string", "minLength": 4},
    "deviceId": {"type": "string", "minLength": 4},
  }
};


exports.create = ajv.compile(deviceCreate);
exports.delete = ajv.compile(deviceDelete);
exports.rename = ajv.compile(deviceRename);
