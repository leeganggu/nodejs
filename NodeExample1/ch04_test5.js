let fs = require('fs');

let data = fs.readFileSync('./package.json', 'utf8');

console.log(data);