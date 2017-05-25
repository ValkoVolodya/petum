var Ajv = require('ajv');
var ajv = new Ajv({ allErrors: true });

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
