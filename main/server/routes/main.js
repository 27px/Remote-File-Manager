// main
const express=require("express");
const route=express.Router();
const config=require("../config/config.json");

// plugins
const SSH2Promise=require('ssh2-promise');
const nodeDiskInfo=require('node-disk-info');

// modules
const { getPath, normalize_path }=require("../functions/path_functions.js");

// default
// const path=require("path");
// const fs=require("fs").promises;

// dev dependencies
const chalk=require("chalk");

// global
let connections={}; // ssh connections with key as user@host and value as connection object

// Connect to ssh server
route.post("/fs/ssh/connect",async(req,res)=>{
  const server=req.body.server;
  const user=req.body.user;
  const password=req.body.password;
  const id=`${user}@${server}`;
  let ssh=null;
  try
  {
    if(typeof connections[id] !== 'undefined')
    {
      await connections[id].ssh.close();
    }
    ssh=new SSH2Promise({
      host: server,
      username: user,
      password: password,
      reconnectTries: 2,
      reconnectDelay: 0,
    });
  }
  catch(err)
  {
    ssh=null;
    res.json({
      status:false,
      message:"Some error occured",
      error_log:error.message
    });
  }
  if(ssh!==null)
  {
    ssh.connect()
    .then(()=>ssh.sftp())
    .then(sftp=>{
      connections[id]={ ssh, sftp };
      res.json({
       status:true
      });
    }).catch(error=>{
      // console.log(error);
      res.json({
        status:false,
        message:"Some error occured",
        error_log:error.message
      });
    });
  }
});

// Get contents of folder
route.post("/fs/:protocol/dir-contents",(req,res)=>{
  let protocol=req.params.protocol;
  let dir_path=normalize_path(req.body.path);
  if(protocol==="ssh")
  {
    var ssh=new SSH2Promise({
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
        // console.log(error);
        throw {
          name:"customError",
          message:"Failed to open directory, check if you have acccess",
          error_log:error.message
        };
      }
      let file=[],stat=[],filled=[],properties=[];// filled or not
      data.forEach(async content=>{
        let file_path=getPath(content.filename,dir_path);
        file.push(content.filename);
        stat.push(sftp.stat(file_path));
      });
      stat=await Promise.allSettled(stat);
      // handle error in linux for getting stat
      stat=stat.map(stat_result=>stat_result.status=='fulfilled'?stat_result.value:null);
      properties=[...stat];// file/folder properties like size date etc.
      stat=await Promise.all(stat.map((s,i)=>{
        if(s==null)
        {
          return data[i].longname[0]=='d';
        }
        return !s.isFile();
      }));
      filled=await Promise.allSettled(data.map((content,i)=>stat[i]?sftp.readdir(getPath(content.filename,dir_path)):false));
      filled=filled.map(filled_result=>filled_result.status=='fulfilled'?filled_result.value:null);
      filled=filled.map(fill=>Array.isArray(fill)?fill.length>0:false);
      ssh.close();
      return data.map((content,i)=>{
        return {
          name:file[i],
          folder:stat[i],
          filled:filled[i],
          // properties:properties[i] // not working properly
        }
      });
    }).then(contents=>{
      res.json({
        status:true,
        type:"directory",
        path:dir_path,
        contents
      });
    }).catch(err=>{
      if(err.name!=="customError")
      {
        console.log(err);
      }
      res.json({
        status:false,
        message:(err.name==="customError")?err.message:"Some error occured",
        error_log:(err.name==="customError")?err.error_log:error.message,
        customError:(err.name==="customError")
      });
    });
  }
  else // local
  {
    if(dir_path==="/") // root (get drives)
    {
      nodeDiskInfo.getDiskInfo().then(disks=>{
        res.json({
          status:true,
          type:"drive",
          path:"/",
          contents:disks
        });
      }).catch(err=>{
        console.log(err);
        res.json({
          status:false,
          message:"Some error occured",
          error_log:err.message
        });
      });
    }
    else // get local folders
    {
      res.json({
        in:"dev"
      });
    }
  }
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
