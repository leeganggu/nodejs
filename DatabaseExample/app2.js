
let express = require('express')
, http = require('http')
, path = require('path');

let bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')
, static = require('serve-static')
, errorHandler = require('errorhandler');

let expressErrorHandler = require('express-error-handler');

let expressSeesion = require('express-session');

let MongoClient = require('mongodb').MongoClient;

var database;

//var database;

function connectDB(){
let databaseUrl = 'mongodb://localhost:27017';

    MongoClient.connect(databaseUrl, function(err, client){
    if(err) throw err;

    var db = client.db('local');

    console.log('데이터베이스에 연결되었습니다. : ', databaseUrl);

    database = db;
});
}

function authUser(database, id, password, callback){
    console.log('authUser 호출됨 : ' + id + ', ' + password);

    // users 컬렉션 참조
    var users = database.collection('users');

    // 아이디와 비밀번호를 이용해 검색
    users.find({"id":id, "password":password}).toArray(function(err, docs) {
        if (err) { // 에러 발생 시 콜백 함수를 호출하면서 에러 객체 전달
            callback(err, null);
            return;
        }
        
        if (docs.length > 0) {  // 조회한 레코드가 있는 경우 콜백 함수를 호출하면서 조회 결과 전달
            console.log('아이디 [%s], 패스워드 [%s] 가 일치하는 사용자 찾음.', id, password);
            callback(null, docs);
        } else {  // 조회한 레코드가 없는 경우 콜백 함수를 호출하면서 null, null 전달
            console.log("일치하는 사용자를 찾지 못함.");
            callback(null, null);
        }
    });
}

function addUser(database, id, password, name, callback){
    console.log('addUser 호출됨 : ' + id + ', ' + password + ', ' + name );

    let user = new UserModel({"id":id, "password":password, "name":name});

    user.save(function(err){
        if(err){
            callback(err, null);
            return;
        }
        console.log('사용자 데이터 추가함.');
        callback(null, user);
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

            if(result && result.insertedCount > 0){
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
