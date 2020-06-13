let express = require('express')
    , http = require('http')
    , path = require('path');

let bodyParser = require('body-parser')
    , static = require('serve-static');

let app = express();

app.set('port', process.env.prot || 3000);

app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());

app.use('/public', static(path.join(__dirname, 'public')));

// app.use(function(req, res, next){
//     console.log('첫번째 미들웨어');

//     let paramId = req.body.id || req.query.password;
//     let paramPassword = req.body.password || req.query.password;

//     res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
//     res.write('<h1>Express 서버에서 응답한 결과 입니다.</h1>');
//     res.write('<div><p>param id : ' + paramId + '</p></div>');
//     res.write('<div><p>param password : ' + paramPassword + '</p></div>');
//     res.end();
// });

let router = express.Router();

router.route('/process/login/:name').post(function(req, res){
    console.log('/process/login/:name 처리함');

    let paramName = req.params.name;

    let paramId = req.body.id || req.query.password;
    let paramPassword = req.body.password || req.query.password;

    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
    res.write('<h1>Express 서버에서 응답한 결과 입니다.</h1>');
    res.write('<div><p>param name : ' + paramName + '</p></div>');
    res.write('<div><p>param id : ' + paramId + '</p></div>');
    res.write('<div><p>param password : ' + paramPassword + '</p></div>');
    res.write("<br><br><a href='/public/login2.html'>로그인 페이지로 돌아가기</a>");
    res.end();
});

app.use('/', router);

app.all('*', function(req, res){
    res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>');
});

http.createServer(app).listen(3000, function(){
    console.log('Express 서버가 3000번 포트에서 시작됨.');
});