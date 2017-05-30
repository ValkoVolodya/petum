var log = require(libs + 'log')(module);
var config = require(libs + 'config');
var ajv = new Ajv(config.get('ajvConfig'));
petJSONSchema = {
  "type": "object",
  "required": ["name", "sort", "userId"],
  "properties": {
    "name": {"type": "string"},
    "sort": {"type": "string"},
    "userId": {"type": "string"}
  }
}

module.exports.validate = ajv.compile(petJSONSchema);
