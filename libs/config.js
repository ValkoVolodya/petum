var nconf = require('nconf');

nconf.argv()
    .env()
    .file({ file: './config.js' });

module.exports = nconf;
