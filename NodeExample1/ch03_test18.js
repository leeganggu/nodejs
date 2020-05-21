function Person(name, age){
    this.name = name;
    this.age = age;
}

Person.prototype.walk = function(speed){
    console.log(speed + 'km 속도로 걸어갑니다.');
};

var person01 = new Person('트와이스', 20);
var person02 = new Person('오마이걸', 22);

console.log(person01.name + '객체의 walk(10)을 호출합니다.');
person01.walk(10);

//prototype 을 써서 만들면 인스턴스 객체를 만들 때 메모리를 효율적으로 관리 할 수 있다는 장점이 있다.