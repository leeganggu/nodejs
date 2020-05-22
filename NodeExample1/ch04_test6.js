let fs = require('fs');

fs.readFile('/Users/igang-gu/Documents/brackets-nodejs/NodeExample1/package-lock.json', 'utf8', function(err, data){
    console.log(data);
});

console.log('프로젝트 폴더 안의 package.json 파일을 읽도록 요청했습니다.');