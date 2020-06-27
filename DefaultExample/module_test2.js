let user = require('./user2');

console.dir(user);

function showUser(){
    return user.getUser().name + ', ' + user.group.name;
}

console.log('사용자 정보 : ', showUser());