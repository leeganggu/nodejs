let express = require('express')
    , http = require('http')
    , path = require('path');

let bodyParser = require('body-parser')
    , static = require('serve-static');

var errorHandler = require('errorhandler');

var expressErrorHandler = require('express-error-handler');


let cookieParser = require('cookie-parser');
let expressSession = require('express-session');

let app = express();

app.set('port', process.env.prot || 3000);

app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());

app.use('/public', static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

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

router.route('/process/product').get(function(req, res){
    console.log('/process/product 호출됨.');

    if(req.session.user){
        res.redirect('/public/product.html');
    }else{
        res.redirect('/public/login2.html');
    }
});

router.route('/process/login').post(function(req, res){
    console.log('/process/logout 호출됨.');

    let paramId = req.body.id || req.query.id;
    let paramPassword = req.body.password || req.query.password;

    if(req.session.user){
        console.log('이미 로그인되어 상품 페이지로 이동합니다.');

        res.redirect('/process/product.html');
    }else{
        req.session.user = {
            id: paramId,
            name: '오마이걸',
            authorized:true
        };

        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h1>로그인 성공</h1>');
        res.write('<div><p>Param id : ' + paramId + '</p></div>');
        res.write("<br><br><a href='/process/product'>상품 페이지로 이동하기</a>");
        res.end();
    }
    
});

router.route('/process/logout').get(function(req, res){
    console.log('/process/logout 호출됨.');

    if(req.session.user){
        console.log('로그아웃합니다.');

        req.session.destroy(function(err){
            if(err){throw err;}

            console.log('세션을 삭제하고 로그아웃되었습니다.');
            res.redirect('/public/login2.html');
        });
    }else{
        console.log('아직 로그인되어 있지 않습니다.');

        res.redirect('/public/login2.html');
    }
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