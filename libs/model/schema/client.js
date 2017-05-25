module.exports = {
  "type": "object",
  "required": ["name", "email", "password"],
  "properties": {
    "name": {"type": "string"},
    "email": {"type": "string", "format": "email"},
    "password": {"type": "string", "minLength": 8}
  }
}
