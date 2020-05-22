let fs = require('fs');

let http = require('http');
let server = http.createServer(function(req, res){
    let instream = fs.createReadStream('./output.txt');
    instream.pipe(res);
});

server.listen(7001, '127.0.0.1');