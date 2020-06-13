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

router.route('/process/users/:id').get(function(req, res){
    console.log('/process/users/:id 처리함');

    let paramId = req.params.id;

    console.log('/process/users와 토큰 %s를 이용해 처리함.', paramId);

    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
    res.write('<h1>Express 서버에서 응답한 결과 입니다.</h1>');
    res.write('<div><p>param id : ' + paramId + '</p></div>');
    res.end();
});

app.use('/', router);

let expressErrorHandler = require('node_modules/express-error-handler');

let errorHandler = expressErrorHandler({
    static:{
        '404': './ExpressExample/public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

http.createServer(app).listen(3000, function(){
    console.log('Express 서버가 3000번 포트에서 시작됨.');
});