let fs = require('fs');

let data = fs.readFileSync('/Users/igang-gu/Documents/brackets-nodejs/NodeExample1/package-lock.json', 'utf8');

console.log(data);