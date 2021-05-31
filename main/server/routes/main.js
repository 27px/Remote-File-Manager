// main
const express=require("express");
const route=express.Router();
// const config=require("../config/config.json");

// plugins
const SSH2Promise=require('ssh2-promise');
const nodeDiskInfo=require('node-disk-info');

// modules
const { getPath, normalize_path } = require("../functions/path_functions.js");
const { success_response, error_response, response_directory_contents } = require("../functions/response_functions.js");

// default
// const path=require("path");
// const fs=require("fs").promises;

// dev dependencies
const chalk=require("chalk");

// global
let connections={}; // ssh connections with key as user@host and value as connection object

// Connect to ssh server
route.post("/fs/ssh/connect",async(req,res)=>{
  let host=req.body.server, username=req.body.user, password=req.body.password;
  let ssh=null, id=`${username}@${host}`, reconnectTries=1, reconnectDelay=0; // unique id used to identify server with user
  try {
    if(typeof connections[id] !== 'undefined')
      await connections[id].ssh.close();
    ssh=new SSH2Promise({ host, username, password, reconnectTries, reconnectDelay });
  }
  catch(err) {
    ssh=null;
    res.json(error_response("Some error occured",error.message));
  }
  if(ssh!==null) // no error
  {
    ssh.connect()
    .then(()=>ssh.sftp())
    .then(sftp=>{
      connections[id]={ ssh, sftp };
      res.json(success_response(id));
    }).catch(error=>{
      console.log(2);
      console.log(error);
      res.json(error_response("Some error occured",error.message));
    });
  }
});

// Get contents of folder
route.post("/fs/:protocol/dir-contents",async(req,res)=>{
  let protocol=req.params.protocol;
  let server_id=req.body.server_id;
  let dir_path=normalize_path(req.body.path);
  if(typeof connections[server_id] === 'undefined')
  {
    res.json(error_response("Not connected to server, connect first",`connection undefined`,true));
    return;
  }
  if(protocol==="ssh")
  {
    try
    {
      let sftp=connections[server_id].sftp;
      let data=await sftp.readdir(dir_path);
      let file=[],stat=[],filled=[],readable=[];
      data.forEach(content=>{
        file.push(content.filename);
        stat.push(sftp.stat(getPath(content.filename,dir_path)));
      });
      stat=await Promise.allSettled(stat);
      stat=stat.map(stat_result=>{
        let fulfilled=stat_result.status=='fulfilled';
        readable.push(fulfilled);
        return fulfilled?stat_result.value:null;
      });
      stat=stat.map((s,i)=>data[i].longname[0]=='d');
      filled=await Promise.allSettled(data.map((content,i)=>stat[i]?sftp.readdir(getPath(content.filename,dir_path)):false));
      filled=filled.map(filled_result=>filled_result.status=='fulfilled'?filled_result.value:null);
      filled=filled.map(fill=>Array.isArray(fill)?fill.length>0:false);
      let contents=data.map((content,i)=>{
        return {
          name:file[i],
          folder:stat[i],
          filled:filled[i],
          readable:readable[i],
        }
      });
      res.json(response_directory_contents("directory",dir_path,contents));
    }
    catch(error)
    {
      res.json(error_response("Some error occured",error.message));
    }
  }
  else // local
  {
    ////// not for ubuntu !!!!!
    if(dir_path==="/") // root (get drives)
    {
      nodeDiskInfo.getDiskInfo().then(disks=>{
        res.json(response_directory_contents("drive", dir_path, contents));
      }).catch(error=>{
        res.json(error_response("Some error occured",error.message));
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
  res.json(error_response("Not found","404"));
});

//All other routes
route.get("*",function(req,res){
  //logs requested path
  console.log(`404 : ${req.originalUrl}`);
  res.redirect("/404");
});

module.exports=route;
