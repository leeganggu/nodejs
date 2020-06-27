var require = function(path){
    var exports = {};
        exports.getUser = function(){
            return {id:'test01', name:'twice'};
        };
        exports.group = {id:'group01', name:'친구'};

    return exports;
}

var user = require('...');

function showUser(){
    return user.getUser().name + ', ' + user.group.name;
}

console.log(showUser());