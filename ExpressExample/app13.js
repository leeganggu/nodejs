let express = require('express')
    , http = require('http')
    , path = require('path');

let bodyParser = require('body-parser')
    , cookieParser =require('cookie-parser')
    , static = require('serve-static');

var errorHandler = require('errorhandler')

let expressErrorHandler = require('express-error-handler');

let expressSession = require('express-session');

let multer = require('multer');
let fs = require('fs');

let cors = require('cors');

let app = express();

app.set('port', process.env.prot || 3000);

app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());

app.use('/public', static(path.join(__dirname, 'public')));
app.use('/uploads', static(path.join(__dirname, 'uploads')));

app.use(cookieParser());

app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

app.use(cors());

let storage = multer.diskStorage({
    destination:function (req, file, callback){
        callback(null, 'uploads');
    },
    filename:function(req, file, callback){
        callback(null, file.originalname);
    }
});

let upload = multer({
    storage:storage,
    limits:{
        files:10,
        fileSize:1024*1024*1024
    }
});

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

router.route('/process/photo').post(upload.array('photo', 1), function(req, res){
    console.log('/process/photo 호출됨.');

    try{
        let files = req.files;

        console.dir('#==== 업로드된 첫번째 파일 정보 ====#');
        console.dir(req.files[0]);
        console.dir('#===#');

        let originalname = '',
        filename = '',
        mimetype = '',
        size = 0;

        if(Array.isArray(files)){
            console.log("배열에 들어있는 파일 갯수 : ", files.length);

            for(let index = 0; index < files.length; index++){
                originalname = files[index].originalname;
                filename = files[index].filename;
                mimetype = files[index].mimetype;
                size = files[index].size;
            }
        }else{
            console.log("파일 갯수 : 1");

            originalname = files[index].originalname;
            filename = files[index].name;
            mimetype = files[index].mimetype;
            size = files[index].size;
        }

        console.log('현재 파일 정보 : ' + originalname + ', ' + filename + ', ' + mimetype + ', ' +size);

        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h3>파일 업로드 성공</h3>');
        res.write('<hr/>');
        res.write('<p>원본 파일 이름 : ' + originalname + ' -> 저장 파일명 : ' + filename + '</p>');
        res.write('<p>MIME TYPE : ' + mimetype + '</p>');
        res.write('<p>파일 크기 : ' + size + '</p>');
        res.write("<br><img src='/uploads/" + originalname + "'>");
        res.end();
    }catch(err){
        console.dir(err.stack);
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