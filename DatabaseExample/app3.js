
let express = require('express')
, http = require('http')
, path = require('path');

let bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')
, static = require('serve-static')
, errorHandler = require('errorhandler');

let expressErrorHandler = require('express-error-handler');

let expressSeesion = require('express-session');

let mongoose = require('mongoose');

let MongoClient = require('mongodb').MongoClient;

let database;

let UserSchema;

let UserModel;

function connectDB(){
    let databaseUrl = 'mongodb://localhost:27017/local';

    console.log('데이터베이스 연결을 시도합니다.');
    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl);
    database = mongoose.connection;

    database.on('error', console.error.bind(console, 'mongoose connection error.'));
    database.on('open', function(){
        console.log('데이터베이스에 연결되었습니다. : ', databaseUrl);

        UserSchema = mongoose.Schema({
            id:String,
            name:String,
            password:String
        });
        console.log('UserSchema 정의함.');

        UserModel = mongoose.model("users", UserSchema);
        console.log('UserModel 정의함');
    });

    database.on('disconnected', function(){
        console.log('연결이 끊어졌습니다. 5초 후에 다시 연결 합니다.');
        setInterval(connectDB, 5000);
    });
}

function authUser(database, id, password, callback){
    console.log('authUser 호출됨 : ' + id + ', ' + password);

    UserModel.find({"id":id, "password":password}, function(err, result){
        if(err){
            callback(err, null);
            return;
        }

        console.log('아이디 [%s], 비밀번호 [%s]로 검색 결과 : ', id, password);
        console.dir(result);

        if(result.length > 0){
            console.log('일치하는 사용자 찾음.', id, password);
            callback(null, result);
        }else{
            console.log('일치하는 사용자 찾지 못함.');
            callback(null, null);
        }
    });
};

let addUser = function(database, id, password, name, callback){
    console.log('addUser 호출됨 : ' + id + ', ' + password + ', ' + name );

    let user = new UserModel({"id":id, "password":password, "name":name});

    user.save(function(err, addUser){
        if(err){
            callback(err, null);
            return;
        }
        console.log('사용자 데이터 추가됨');
        callback(null, addUser);
    });
};

let app = express();

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

app.use('/public', static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(expressSeesion({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

let router = express.Router();

router.route('/process/login').post(function(req, res){
console.log('/process/login 호출됨.');

let paramId = req.param('id');
let paramPassword = req.param('password');

if(database){
    authUser(database, paramId, paramPassword, function(err, docs){
        if(err) {throw err;}
        
        if(docs){
            console.dir(docs);
            let username = docs[0].name;
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
            res.write('<h1>로그인 성공</h1>');
            res.write('<div><p>사용자 아이디 : ' +  paramId + '</p></div>');
            res.write('<div><p>사용자 이름 : ' +  username + '</p></div>');
            res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
            res.end();
        }else{
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
            res.write('<h1>로그인 실패</h1>');
            res.write('<div><p>아이디와 비밀번호를 다시 확인하십시오.</p></div>');
            res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
            res.end();
        }
    });
}else{
    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
    res.write('<h1>데이터베이스 연결 실패</h1>');
    res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
    res.end();
}
});

router.route('/process/adduser').post(function(req, res){
    console.log('/process/adduser 호출됨');

    let paramId = req.body.id || req.query.id;
    let paramPassword = req.body.password || req.query.password;
    let paramName = req.body.name || req.query.name;

    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword + ', ' + paramName);

    if(database){
        addUser(database, paramId, paramPassword, paramName, function(err, result){
            if(err) {throw err;}

            if(result){
                console.dir(result);

                res.writeHead('200', {'content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 성공</h2>');
                res.end();
            }else{
                res.writeHead('200', {'content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 실패</h2>');
                res.end();
            }
        });
    }else{
        res.writeHead('200', {'content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
})

app.use('/', router);

// 404 에러 페이지 처리
errorHandler = expressErrorHandler({
static: {
    '404': './DatabaseExample/public/404.html'
}
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );

http.createServer(app).listen(3000, function(){
console.log('Express 서버가 3000번 포트에서 시작됨.');
connectDB();
});

