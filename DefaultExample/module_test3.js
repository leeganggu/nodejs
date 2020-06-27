let user = require('./user3');

function showUer(){
    return user.getUser().name + ', ' + user.group.name;
}

console.log('사용자 정보 : ', showUer());
