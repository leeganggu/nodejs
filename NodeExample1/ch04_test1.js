let url = require('url');

let curURL = url.parse('https://m.search.naver.com/search.naver?query=steve+jobs&where=m&sm=mtp_hty');

let curStr = url.format(curURL);

console.log('주소 문자열 : ', curStr);
console.dir(curURL);

let querystring = require('querystring');
let param = querystring.parse(curURL.query);

console.log('요청 파라미터 중 query의 값 : ', param.query);
console.log('원본 요청 파라미터 : ', querystring.stringify(param));