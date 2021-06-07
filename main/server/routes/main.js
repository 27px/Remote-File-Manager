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

// Connect to ssh server
route.post("/fs/ssh/connect",async(req,res)=>{
  let host=req.body.server, username=req.body.user, password=req.body.password;
  let ssh=null, id=`${username}@${host}`, reconnectTries=1, reconnectDelay=0, readyTimeout=5000; // unique id used to identify server with user
  try {
    if(typeof connections[id] !== 'undefined')
      await connections[id].ssh.close();
    ssh=new SSH2Promise({ host, username, password, reconnectTries, reconnectDelay, readyTimeout});
  }
  catch(error) {
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
      // console.log(error);
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
      let stat=await Promise.allSettled(data.map(content=>sftp.stat(getPath(content.filename,dir_path))));
      stat=stat.map(stat_result=>stat_result.status=='fulfilled'?stat_result.value:null);
      let filled=await Promise.allSettled(data.map((content,i)=>{
        return data[i].longname[0]=='d'?sftp.readdir(getPath(content.filename,dir_path)):false
      }));
      let contents=data.map((content,i)=>{
        let readable=filled[i].status=='fulfilled'; // read properly
        return {
          name:content.filename,
          folder:content.longname[0]=='d',
          permissions:content.longname.slice(1,10),
          filled:readable?filled[i].value.length>0:null,
          readable
        };
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
