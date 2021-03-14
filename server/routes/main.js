const SSH2Promise=require('ssh2-promise');
const express=require("express");
const route=express.Router();
const config=require("../config/config.json");
const path=require("path");
const {getPath}=require("../functions/path_functions.js");

const chalk=require("chalk");

// const fs=require("fs");

// route.use(cookieParser());

//Main Root
// route.get("/",(req,res)=>{
//   res.redirect("/home");
// });

// Get contents of folder
route.post("/ssh/getDirectoryContents",(req,res)=>{
  let dir_path=path.normalize(req.body.path) || "/";
  dir_path=dir_path.replace(/\.$/,"").replace(/\\/g,"/");
  let ssh=new SSH2Promise({
    host: config.SSH[0].HOST,
    username: config.SSH[0].USER,
    password: config.SSH[0].PASSWORD
  });
  ssh.connect()
  .then(()=>ssh.sftp())
  .then(async sftp=>{
    let data;
    try
    {
      data=await sftp.readdir(dir_path)
    }
    catch(error)
    {
      console.log(error.message);
      throw {
        name:"customError",
        message:error.message
      };
    }
    let file=[],stat=[],filled=[],properties=[];// filled or not
    data.forEach(content=>{
      let file_path=getPath(content.filename,dir_path);
      file.push(content.filename);
      stat.push(sftp.stat(file_path));
    });
    stat=await Promise.all(stat);
    properties=[...stat];// file/folder properties like size date etc.
    stat=await Promise.all(stat.map(s=>s.isDirectory()))
    filled=await Promise.all(data.map((content,i)=>stat[i]?sftp.readdir(getPath(content.filename,dir_path)):false));
    filled=filled.map(fill=>Array.isArray(fill)?fill.length>0:false);
    ssh.close();
    return data.map((content,i)=>{
      return {
        name:file[i],
        folder:stat[i],
        filled:filled[i],
        properties:properties[i]
      }
    });
  }).then(contents=>{
    res.json({
      status:true,
      path:dir_path,
      contents
    });
  }).catch(err=>{
    console.log(err);
    res.json({
      status:false,
      message:(err.name==="customError")?err.message:"Some error occured",
      error_log:err.message
    });
  });
});

// use another route
// route.use("/data",data);

//Not Found
route.get("/404",function(req,res){
  res.status(404);
  res.json({
    status:false,
    message:"Not found",
    error_log:404
  });
});

//All other routes
route.get("*",function(req,res){
  //logs requested path
  console.log(`404 : ${req.originalUrl}`);
  res.redirect("/404");
});

module.exports=route;
