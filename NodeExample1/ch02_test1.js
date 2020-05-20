var result = 0;

console.time('duration_sum');

for(var i = 1; i <= 1000; i++){
    result += i;
}

console.timeEnd('duration_sum');
console.log('1부터 1000까지 더한 결과물 : %d', result);

console.log('파일이름 : %s', __filename);
console.log('파일패스 : %s', __dirname);

var Person = {name:"트와이스", age:20};
console.dir(Person);
