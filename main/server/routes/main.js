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
const fs=require("fs").promises;

// dev dependencies
const chalk=require("chalk");

// Connect to ssh server
route.post("/fs/ssh/connect",async(req,res)=>{
  let host=req.body.server, username=req.body.user, password=req.body.password;
  let ssh=null, id=`${username}@${host}`, reconnectTries=1, reconnectDelay=0, readyTimeout=5000; // unique id used to identify server with user
  try {
    if(typeof connections[id] == 'undefined')
      ssh=new SSH2Promise({ host, username, password, reconnectTries, reconnectDelay, readyTimeout});
    // if(typeof connections[id] !== 'undefined')
    //   await connections[id].ssh.close();
    // ssh=new SSH2Promise({ host, username, password, reconnectTries, reconnectDelay, readyTimeout});
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
  else
  {
    res.json(success_response(id));
  }
});

// Get contents of folder
route.post("/fs/:protocol/dir-contents",async(req,res)=>{
  let protocol=req.params.protocol, server_id=req.body.server_id;
  let dir_path=normalize_path(req.body.path);
  if(protocol==="ssh")
  {
    if(typeof connections[server_id] === 'undefined')
    {
      res.json(error_response("Not connected to server, connect first",`connection undefined`,true));
      return;
    }
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
          contentCount:readable?filled[i].value.length:null,
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
  else if(isWin && dir_path==="/") // local and windows and loading root path, so load drives
  {
    nodeDiskInfo.getDiskInfo().then(async disks=>{
      let in_drive_contains=await Promise.allSettled(disks.map(disk=>{
        return fs.readdir(disk._mounted);
      }));
      let contents=disks.map((disk,i)=>{
        let readable=in_drive_contains[i].status=="fulfilled";
        let sub_content=in_drive_contains[i].value; // not sent to client
        let filled=readable?sub_content.length>0:null;
        let contentCount=readable?sub_content.length:null; // contents inside the dives
        let content = { // unlike dir contents permissions are not sent
          folder:true,
          name:disk._mounted,
          capcity:{
            percentage:disk._capacity, // in case numbers large to calculate
            total_space:disk._blocks,
            available_space:disk._available,
            used_space:disk._used,
          },
          contentCount,
          filled,
          readable
        };
        return content;
      });
      res.json(response_directory_contents("drive", dir_path, contents));
    }).catch(error=>{
      res.json(error_response("Some error occured",error.message));
    });
  }
  else // not windows or not loading root path /
  {
    dir_path=dir_path.endsWith(":")?`${dir_path}//`:dir_path; // add double slash if path does not have "//" after colon
    let data=await fs.readdir(dir_path);
    let stat=await Promise.allSettled(data.map(content=>{
      return fs.stat(getPath(content,dir_path));
    }));
    stat=stat.map(stat_result=>stat_result.status=='fulfilled'?stat_result.value:null);
    let isDir=stat.map((item_stat,i)=>{
      return item_stat==null?!data[i].includes("."):item_stat.isDirectory(); // stat is not available, probable permission issue, so check if "." is present to check file or not, does not work in different cases;
    });
    let filled=await Promise.allSettled(data.map((content,i)=>{
      return isDir[i]?fs.readdir(getPath(content,dir_path)):false;
    }));
    let contents=data.map((content,i)=>{
      let readable=filled[i].status=='fulfilled'; // read properly
      return {
        name:content,
        folder:isDir[i],
        permissions:null, ///// cannot get from long name
        filled:readable?filled[i].value.length>0:null,
        contentCount:readable?filled[i].value.length:null,
        readable
      };
    });
    res.json(response_directory_contents("directory",dir_path,contents));
  }
});

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
