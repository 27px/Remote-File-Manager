// global
process_id=null;

const fs=require("fs").promises;
const { getPath } = require("../functions/path_functions.js");
const chalk=require("chalk");

function send(obj)
{
  socket.send(JSON.stringify(obj));
}

function send_error(log = null, message="Something went wrong", type="failed")
{
  send({ process_id, type, message, log });
}

function send_success(message="Completed Successfully", reload=false, type="completed")
{
  send({ process_id, message, type, reload });
}

function recursiveFolderDelete(connection,root_path)
{
  return new Promise(async(resolve, reject)=>{
    try {
      let data=await connection.readdir(root_path);
      await Promise.all(data.map(async item=>{
        try {
          let full_path=getPath(item.filename,root_path);
          if(item.longname[0]=='d') {
            return recursiveFolderDelete(connection,full_path);
          } else {
            return connection.unlink(full_path);
          }
        } catch (error) {
          reject(error.message);
        }
      }));
      await connection.rmdir(root_path);
    } catch(error) {
      reject(error.message);
    } finally {
      resolve(true);
    }
  });
}

module.exports=async operation=>{
  process_id = operation.process_id;
  let server=operation.data.source.server;
  let connection = connections[server];
  if(typeof connection === 'undefined' && server!=null) { // either connected or local
    return send_error(null,"Not Connected to Server");
  }
  connection=server!=null?connection.sftp:fs; // if ssh use sftp else if local fs
  if(typeof connection === 'undefined') {
    return send_error(null,"Not Connected");
  }
  if(operation.type==='new-folder')
  {
    let name=operation.data.files[0];
    let new_path = getPath(name,operation.data.source.baseFolder);
    connection.mkdir(new_path)
    .then(()=>{
      send_success(`Created "${name}" Successfully`,true);
    }).catch(error=>{
      send_error(error.message);
    });
  }
  else if(operation.type==='new-file')
  {
    let name=operation.data.files[0];
    let new_path = getPath(name,operation.data.source.baseFolder);
    connection.writeFile(new_path,"")
    .then(()=>{
      send_success(`Created "${name}" Successfully`,true);
    }).catch(error=>{
      send_error(error.message);
    });
  }
  else if(operation.type==='delete')
  {
    try {
      let queue=operation.data.files,baseFolder=operation.data.source.baseFolder;
      queue=queue.map(item=>{
        let del_path=getPath(item.name,baseFolder)
        if(item.isFolder) {
          if(server==null) {
            return connection.rmdir(del_path, { recursive: true });
          }
          return recursiveFolderDelete(connection,del_path);
        }
        return connection.unlink(del_path);
      });
      queue=await Promise.allSettled(queue);
      let allSuccess=!(queue.some(del=>del.status!="fulfilled"));
      let allFailed=queue.every(del=>del.status!="fulfilled");
      if(allSuccess) {
        send_success("Deleted items successfully",true);
      } else if(allFailed) {
        send_error("Failed to delete");
      } else { // partial success
        send_success("Some items deleted, but some items could not be deleted",true,"partial-success");
      }
    } catch (error) {
      send_error(error.message);
    }
  }
};
