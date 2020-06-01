let http = require('http');

let server = http.createServer();

// let port = 3000;
// server.listen(port, function(){
//     console.log('웹 서버가 시작되었습니다. : ', port);
// });

let host = '192.168.0.138';
let port = 3001;
server.listen(port, host, '50000', function(){
    console.log('웹 서버가 시작되었습니다. : %s, %d', host, port);
});