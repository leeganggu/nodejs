let output = '안녕 1!';

let buffer1 = Buffer.alloc(10);
let len = buffer1.write(output, 'utf8');
console.log('첫번째 버퍼의 문자열 : ', buffer1.toString());

let buffer2 = Buffer.from('안녕 2!', 'utf8');
console.log('두번째 버퍼의 문자열 : ', buffer2.toString());

console.log('버퍼 객체의 타입 : ', Buffer.isBuffer(buffer1));

let byteLen = Buffer.byteLength(output);
let str1 = buffer1.toString('utf8', 0, byteLen);
let str2 = buffer2.toString('utf8');

buffer1.copy(buffer2, 0, 0, len);
console.log('두번째 버퍼에 복사한 후의 문자열 : ', buffer2.toString('utf8'));

let buffer3 = Buffer.concat([buffer1, buffer2]);
console.log('두개의 버퍼를 붙인 후의 문자열 : ', buffer3.toString('utf8'));
