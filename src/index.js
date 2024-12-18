
import dotenv from "dotenv"

//import mongoose from "mongoose";
//import { DB_NAME } from "./constants";

import connectDB from "./db/index.js";

dotenv.config({
    path: "./env"
})

connectDB()
.then(process.env.PORT, ()=>{
    app.on("error",(error)=>{
        console.log('error', error );
        throw error;
    })
    app.listen(`server is running on PORT ${process.env.PORT}`)
})
.catch((error)=>{
    console.log("error from db connection", error);
})




/*
import express from "express";
const app=express()

(async()=>{
    try {

        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.on("error",(error)=>{
            console.log('error', error );
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log('app is runniing on port no 8000')
        });

    } catch (error) {
        console.log('Error: ', error);
        throw error;
    }
})()*/
