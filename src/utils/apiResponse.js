
class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export { ApiResponse }


function common(name, age){

    var nName=name;
    var aAge=age;

    return ()=>{
        console.log(`Name:${nName} age:${aAge}`)
    }
}

var CallFn= new common("paras", 35);

CallFn();