
const getDetails=(type)=>{

    if(type=='admin'){
        let user={
            id:1,
            Name:"Jai",
            Tyepe:"Admin"
        }

        return user;
    }

    if(type=='user'){
        let user={
            id:2,
            Name:"Mahesh",
            Tyepe:"User"
        }

        return user;
    }
}

module.exports={getDetails}
