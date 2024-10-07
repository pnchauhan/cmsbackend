require('dotenv').config();

const express = require("express");
const app=express();
const PORT=process.env.PORT;

app.get('/',(req, res)=>{
    console.log('hello world');
    res.send('its comming from backend');
});

app.get('/hello', (req, res)=>{

    res.send('this is hello')
})

app.listen(PORT,()=>{
    console.log('server is running on port 8000')
});