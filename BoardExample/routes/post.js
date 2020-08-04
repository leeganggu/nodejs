var addpost = function(req, res){
    console.log('post 모듈 안에 있는 addpost 호출됨.');

    var paramTitle = req.body.title || req.query.title;
    var paramContents = req.body.contents || req.query.contents;
    var paramWriter = req.body.writer || req.query.writer;

    console.log('요청 파라미터 : ' + paramTitle + ', ' + paramContents + ', ' + paramWriter);

    var database = req.app.get('database');

    if(database.db){
        database.UserModel.findByEmail(paramWriter, function(err, results){
            if(err){
                console.log('게시판 글 추가 중 오류 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>게시판 글 추가 중 오류 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }

            if(results == undefined || results.length < 1){
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 [' + paramWriter + '를 찾을 수 없습니다.</h2>');
                res.end();

                return;
            }

            var userObjectId = results[0]._doc._id;
            console.log('사용자 ObjectId : ' + paramWriter + ' -> ' +userObjectId);

            var post = new database.PostModel({
                title : paramTitle,
                contents : paramContents,
                writer : userObjectId
            });

            post.savePost(function(err, result){
                if(err){throw err;}

                console.log('글 데이터 추가함');
                console.log('글 작성', '포스팅 글을 생성했습니다. : ' + post._id); 

                return res.redirect('/process/showpost' + post._id);
            });

        });
        }
    }
}