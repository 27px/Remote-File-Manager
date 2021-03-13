const SSH2Promise=require('ssh2-promise');
const express=require("express");
const route=express.Router();
// const fs=require("fs");
// const path=require("path");

// route.use(cookieParser());

//Main Root
// route.get("/",(req,res)=>{
//   res.redirect("/home");
// });

route.get("/ssh/getDirectoryContents",(req,res)=>{
  new SSH2Promise({
    host: config.SSH.HOST,
    username: config.SSH.USER,
    password: config.SSH.PASSWORD,
  })
});

// use another route
// route.use("/data",data);

//Not Found
route.get("/404",function(req,res){
  res.status(404);
  res.json({
    status:false,
    message:"Not found",
    log:404
  });
});

//All other routes
route.get("*",function(req,res){
  //logs requested path
  console.log(`404 : ${req.originalUrl}`);
  res.redirect("/404");
});

module.exports=route;
