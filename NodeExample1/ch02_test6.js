var nconf = require('nconf');
nconf.env();

console.log(nconf.get('version'));
