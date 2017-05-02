var nconf = require('nconf');

nconf.argv()
    .env()
    .file({ file: './confg.js' });

module.exports = nconf;
