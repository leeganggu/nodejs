let express = require('express')
    , http = require('http')
    , path = require('path');

let bodyParser = require('body-parser')
    , static = require('serve-static');

let expressSession = require('express-session');

let multer = require('multer');
let fs = require('fs');

let app = express();

app.set('port', process.env.prot || 3000);

app.use(bodyParser.urlencoded({extended:false}));

// app.use(bodyParser.json());

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
        callback(null, 'ExpressExample/Mission03/uploads');
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

router.route('/process/memo').post(upload.array('photo', 1), function(req, res){
    console.log('memo 미들웨어 요청');

    let paramWriter = req.body.writer || req.query.writer;
    let paramDate = req.body.date || req.query.date;

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

    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
    res.write('<h1>메모가 저장되었습니다.');
    res.write("<br><img style='width:200px' src='/uploads/" + originalname + "'>");
    res.write("<br><h5>http://localhost:3000/uploads/" + filename + "</h5>");
    res.write('<br><br><input type="submit" value="다시작성" onclick="javascript:history.back()">');
    res.end();
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
});