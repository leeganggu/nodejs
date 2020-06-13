
let express = require('express')
, http = require('http')
, path = require('path');

let bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')
, static = require('serve-static')
, errorHandler = require('errorhandler');

let expressErrorHandler = require('express-error-handler');

let expressSeesion = require('express-session');

let mysql = require('mysql');

let pool = mysql.createPool({
    connectionLimit:10,
    host:'localhost',
    user:'root',
    password:'Roffjrtl1247#',
    database:'test2',
    debug:false
});

var database;

let addUser = function(id, name, age, password, callback){
    console.log('addUser 호출됨');

    pool.getConnection(function(err, conn){
        if(err){
            if(conn){
                conn.release();
            }

            callback(err, null);
            return;
        }
        console.log('데이터베이스 연결 스레드 아이디 : ', conn.threadId);

        let data = {id:id, name:name, age:age, password:password};

        let exec = conn.query('insert into users set ?', data, function(err, result){
            conn.release();
            console.log('실행 대상 SQL : ', exec.sql);

            if(err){
                console.log('sql 실행 시 오류 발생함');
                console.dir(err);

                callback(err, null);

                return;
            }

            callback(null, result);
        });
    })
}

function authUser(id, password, callback){
    console.log('authUser 호출됨 : ' + id + ', ' + password);

    pool.getConnection(function(err, conn){
        if(err){
            if(conn){
                conn.release();
            }
                callback(err, null);
                return;
            }
            console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

            let columns = ['id', 'name', 'age'];
            let tablename = 'users';

            let exec = conn.query('select ?? from ?? where id = ? and password = ?', [columns, tablename, id, password], function(err, rows){
                conn.release();
                console.log('실행 대상 sql : ' + exec.sql);

                if(rows.length > 0){
                    console.log('아이디[%s], 패스워드[%S]가 일치하는 사용자 찾음.', id, password);
                    callback(null, rows);
                }else{
                    console.log('일치하는 사용자를 찾지 못함');
                    callback(null, null);
                }
            });
        });
}

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

    let paramId = req.body.id || req.query.id;
    let paramPassword = req.body.password || req.query.password;

    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword);

    if(pool){
        authUser(paramId, paramPassword, function(err, rows){
            if(err){
                console.error('사용자 로그인 중 오류 발생 : ' + err.stack);
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 로그인 중 오류 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();
                return;
            }

            if(rows){
                console.dir(rows);

                let username = rows[0].name;

                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인 성공</h1>');
                res.write('<div><p>사용자 아이디 : ' + paramId + '</p></div>');
                res.write('<div><p>사용자 이름 : ' + username + '</p></div>');
                res.write("<br><br><a href='/public/login2.html>다시 로그인하기</a>");
                res.end();

            }
        })
    }
});

router.route('/process/adduser').post(function(req, res){
    console.log('/process/adduser 호출됨.');
    
    let paramId = req.body.id || req.query.id;
    let paramPassword = req.body.password || req.query.password;
    let paramName = req.body.name || req.query.name;
    let paramAge = req.body.age || req.query.age;

    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword + ', ' + paramName + ', ' + paramAge);

    if(pool){
        addUser(paramId, paramName, paramAge, paramPassword, function(err, addedUser){
            if(err){
                console.error('사용자 추가 중 오류 발생 : ', err.stack);

                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                c
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }

            if(addedUser){
                console.dir(addedUser);

                console.log('inserted ' + addedUser.affectedRows + ' rows');

                let insertId = addedUser.insertId;
                console.log('추가한 레코드의 아이디 : ' + insertId);

                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 성공</h2>');
                res.end();
            }else{
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 실패</h2>');
                res.end();
            }
        });
    }else{
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }


    });

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
});
