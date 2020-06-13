let express = require('express')
    , http = require('http')
    , path = require('path');

let bodyParser = require('body-parser')
    , static = require('serve-static');

var errorHandler = require('errorhandler');

var expressErrorHandler = require('express-error-handler');


let cookieParser = require('cookie-parser');

let app = express();

app.set('port', process.env.prot || 3000);

app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());

app.use('/public', static(path.join(__dirname, 'public')));

app.use(cookieParser());

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

router.route('/process/showCookie').get(function(req, res){
    console.log('/process/showCookie 호출됨.');

    res.send(req.cookies);
});

router.route('/process/setUserCookie').get(function(req, res){
    console.log('/process/setUserCookie 호출됨.');

    res.cookie('user', {
        id:'mike',
        name:'오마이걸',
        authorized:true
    });

    res.redirect('/process/showCookie');
});

app.use('/', router);

// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
    static: {
      '404': './ExpressExample/public/404.html'
    }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );

http.createServer(app).listen(3000, function(){
    console.log('Express 서버가 3000번 포트에서 시작됨.');
});