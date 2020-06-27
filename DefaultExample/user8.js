function User(id, name){
    this.id = id;
    this.name = name;
}

User.prototype.getUser = function(){
    return {id:this.id, name:this.name};
};

User.prototype.group = {id:'group01', name:'친구'};

User.prototype.printUser = function(){
    console.log('user 이름 : ' + this.name + ', group : ' + this.group.name);
};

module.exports = new User('test01', 'twice');