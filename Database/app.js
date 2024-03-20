const express = require("express");
const mysql = require("mysql2");
const  app = express();
const dotenv=require("dotenv");

dotenv.config({path:'./.env'})

const db= mysql.createConnection({
    host:process.env.DatabaseHost,
    user:process.env.DatabaseUser,
    password:process.env.DatabasePass,
    database:process.env.Database
    
});

db.connect((err)=>{
    if(err){
        console.log(err)
    }else{
        console.log("Mysql Connected")
    }
})

app.get("/",(req,res)=>{
    res.send("<h1>Home page</h1>")
});
app.listen(5001,()=>{
    console.log("Server statrete");
})