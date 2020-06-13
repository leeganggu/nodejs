let express = require('express')
    , http = require('http')
    , path = require('path');

let bodyParser = require('body-parser')
    , static = require('serve-static');

let expressSession = require('express-session');

let multer = require('multer');
let fs = require('fs');

var mongoose = require('mongoose');

let app = express();

app.set('port', process.env.prot || 3000);

app.use(bodyParser.urlencoded({extended:false}));

app.use(static(path.join(__dirname, 'memo')));
app.use('/uploads', static(path.join(__dirname, 'uploads')));

app.use(express.json());

app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

let storage = multer.diskStorage({
    destination:function(req, file, callback){
        callback(null, 'DatabaseExample/Mission04/uploads');
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

var database;

// 데이터베이스 스키마 객체를 위한 변수 선언
var UserSchema;

// 데이터베이스 모델 객체를 위한 변수 선언
var MemoModel;

//데이터베이스에 연결
function connectDB() {
	// 데이터베이스 연결 정보
	var databaseUrl = 'mongodb://localhost:27017/local';
	 
	// 데이터베이스 연결
    console.log('데이터베이스 연결을 시도합니다.');
    mongoose.Promise = global.Promise;  // mongoose의 Promise 객체는 global의 Promise 객체 사용하도록 함
	mongoose.connect(databaseUrl);
	database = mongoose.connection;
	
	database.on('error', console.error.bind(console, 'mongoose connection error.'));	
	database.on('open', function () {
		console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);
		
        
		// user 스키마 및 모델 객체 생성
		createUserSchema();
		
		
	});
	
    // 연결 끊어졌을 때 5초 후 재연결
	database.on('disconnected', function() {
        console.log('연결이 끊어졌습니다. 5초 후 재연결합니다.');
        setInterval(connectDB, 5000);
    });
}

// user 스키마 및 모델 객체 생성
function createUserSchema() {

	// 스키마 정의
	// password를 hashed_password로 변경, 각 칼럼에 default 속성 모두 추가, salt 속성 추가
	UserSchema = mongoose.Schema({
        author:String,
	    created_at:Date,
	    text:String,
	    path:String
	}, {versionKey:false});
	
	// 필수 속성에 대한 유효성 확인 (길이값 체크)
	UserSchema.path('author').validate(function (author) {
		return author.length;
	}, 'author 칼럼의 값이 없습니다.');
	
	console.log('UserSchema 정의함.');
	
	// User 모델 정의
	MemoModel = mongoose.model("memo_Mission04", UserSchema);
	console.log('memo_Mission04 정의함.');
	
}

var addMemo = function(paramWriter, paramDate, contents, path, callback) {
	console.log('addMemo 호출됨 : ');
    
    var memo = new MemoModel({"author":paramWriter, "created_at":paramDate, "text":contents, "path":path});
    
    memo.save(function(err, addedmemo) {
        console.dir(addedmemo);
		if (err) {
			callback(err, null);
			return;
		}
		
	    console.log("메모 데이터 추가함.");
	    callback(null, addedmemo);
	     
	});
}

let router = express.Router();

router.route('/process/memo').post(upload.array('photo', 1), function(req, res){
    console.log('memo 미들웨어 요청');

    let paramWriter = req.body.writer || req.query.writer;
    let paramDate = req.body.date || req.query.date;
    let contents = req.body.contents || req.query.contents;


    req.session.user = {
        writer: paramWriter,
        name: paramDate,
        authorized:true
    };

    let originalname = '',
    filename = '',
    mimetype = '',
    size = 0;
    path = '';

    try{
        console.log('여기까지');
        let files = req.files;

        console.log("배열에 들어있는 파일 갯수 : ", files.length);


        for(let index = 0; index < files.length; index++){
            originalname = files[index].originalname;
            filename = files[index].filename;
            mimetype = files[index].mimetype;
            size = files[index].size;
            path = files[index].path;
        }

        console.log('현재 파일 정보 : ' + originalname + ', ' + filename + ', ' + mimetype + ', ' +size);

    }catch(err){
        console.dir(err.stack);
    }

    if(database){
        addMemo(paramWriter, paramDate, contents, path, function(err, addmemo){
            if (err) {
                console.error('메모 추가 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>메모 추가 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }

            if(addmemo){
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>메모가 저장되었습니다.');
                res.write("<br><img style='width:200px' src='/uploads/" + originalname + "'>");
                res.write("<br><h5>http://localhost:3000/uploads/" + filename + "</h5>");
                res.write('<br><br><input type="submit" value="다시작성" onclick="javascript:history.back()">');
                res.end();
            }else{
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>메모 추가  실패</h2>');
				res.end();
            }
        });
    

    }else{
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
    }
});

router.route('/process/memoReturn').post(function(req, res){
    console.log('memoReturn 미들웨어 요청');
    console.log(req.session.user.writer);

    res.send({writer:req.session.user.writer});
    res.redirect('/memo.html');
});

app.use('/', router);

http.createServer(app).listen(3000, function(){
    console.log('Express 서버가 3000번 포트에서 시작됨.');
    connectDB();
});