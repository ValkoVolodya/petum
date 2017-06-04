var Ajv = require('ajv');
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var config = require(libs + 'config');
var ajv = new Ajv(config.get('ajvConfig'));

temperatureView = {
  "type": "object",
  "required": ["deviceId", "period"],
  "properties": {
    "deviceId": {"type": "string", "minLength": 4},
    "period": {"type": "integer", "minimum": 0, "maximum": 5},
  }
};


exports.temperatureView = ajv.compile(temperatureView);
