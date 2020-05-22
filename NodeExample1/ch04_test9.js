let fs = require('fs');

fs.open('./output.txt', 'r', function(err, fd){
    if(err) throw err;

    // let buf = new Buffer(10);
    let buf = Buffer.alloc(10);
    
    console.log('버퍼 타입 : ', Buffer.isBuffer(buf));
    
    fs.read(fd, buf, 0, buf.length, null, function(err, bytesRead, buffer){
        if(err) throw err;

        let inStr = buffer.toString('utf8', 0, bytesRead);
        console.log('파일에서 읽은 데이터 : ', inStr);

        console.log(err, bytesRead, buffer);

        fs.close(fd, function(){
            console.log('output.txt 파일을 열고 읽기 완료');
        });
    });
});