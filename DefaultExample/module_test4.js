let user = require('./user4');

function showUser(){
    return user().name;
}

console.log(showUser());