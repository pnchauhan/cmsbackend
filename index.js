require('dotenv').config();

const express = require("express");
const app=express();
const PORT=process.env.PORT;

const {getDetails}=require('../cmsBackend/common/common');

app.get('/',(req, res)=>{
    console.log('hello world');
    let result =getDetails('user')
    res.json({message:'success', data:result});
});

app.get('/hello', (req, res)=>{

    res.send('this is hello')
})

app.get('/helloJi', (req, res)=>{

    res.send('this is hello')
})

app.listen(PORT,()=>{
    console.log('server is running on port 8000')
});