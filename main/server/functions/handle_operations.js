// global
process_id=null;

const fs=require("fs");
const fsp=fs.promises;
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

async function checkIsFolder(item, path)
{
  // if long name not available it is local
  if(typeof item.longname === 'undefined') {
    const stat = await fsp.lstat(path);
    return stat.isDirectory();
  } else {
    return item.longname[0]=='d';
  }
}

function copyToPath(source,source_promise,source_path,target,target_promise,target_path,isFolder,isMove=false)
{
  return new Promise(async(resolve,reject)=>{
    try {
      if(isFolder) { // create folder
        await target_promise.mkdir(target_path).catch(async e=>{ // check if failed due to already exixts error
          stat = await target_promise.stat(target_path).catch(err=>reject(err));
        });
        let data = await source_promise.readdir(source_path);
        await Promise.all(data.map(async item=>{
          try {
            let filename=typeof item === 'string' ? item : item.filename;
            let full_source_path=getPath(filename,source_path);
            let full_target_path=getPath(filename,target_path);
            let isItemDirectory=await checkIsFolder(item,full_source_path);
            return copyToPath(source,source_promise,full_source_path,target,target_promise,full_target_path,isItemDirectory,isMove);
          } catch (error) {
            reject(error.message);
          }
        }));
        if(isMove) {
          await source_promise.rmdir(source_path);
        }
      }
      else {
        await new Promise(async(res,rej)=>{
          try {
            let [source_stream, target_stream] = await Promise.all([
              source.createReadStream(source_path),
              target.createWriteStream(target_path)
            ]);
            source_stream.on("error",error=>{
              rej(error); // reject
            });
            source_stream.pipe(target_stream);
            source_stream.on("end",async()=>{
              if(isMove) {
                await source_promise.unlink(source_path);
              }
              res(true); // resolve
            });
          } catch (err) {
            rej(err); // reject
          }
        })
      }
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
  connection=server!=null?connection.sftp:fsp; // if ssh use sftp else if local fs.promises
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
  else if(operation.type == 'copy-paste' || operation.type == 'cut-paste')
  {
    let isMove = operation.type == 'cut-paste'; // move
    connection=server!=null?connection:fs; // if not sftp use local fs // not fsp
    let target=operation.data.target.server;
    let target_connection = connections[target];
    if(typeof target_connection === 'undefined' && target!=null) { // either connected or local
      return send_error(null,"Not Connected to Server");
    }
    target_connection=target!=null?target_connection.sftp:fs; // if ssh use sftp else if local fs // not fsp
    if(typeof target_connection === 'undefined') {
      return send_error(null,"Not Connected");
    }
    let connection_promise=server==null?fsp:connection;
    let target_promise=target==null?fsp:target_connection;
    try {
      let queue=operation.data.files,baseFolder=operation.data.source.baseFolder;
      let targetBaseFolder=operation.data.target.baseFolder;
      queue=queue.map(item=>{
        let source_path=getPath(item.name,baseFolder);
        let target_path=getPath(item.name,targetBaseFolder);
        return copyToPath(connection,connection_promise,source_path,target_connection,target_promise,target_path,item.isFolder,isMove);
      });
      queue=await Promise.allSettled(queue);
      let allSuccess=!(queue.some(del=>del.status!="fulfilled"));
      let allFailed=queue.every(del=>del.status!="fulfilled");
      if(allSuccess) {
        send_success("Copied successfully",true);
      } else if(allFailed) {
        send_error("Failed to copy");
      } else { // partial success
        send_success("Some items copied, but some items could not be copied",true,"partial-success");
      }
    } catch (error) {
      console.log(chalk.yellow.inverse("4"));
      console.log(error);
      send_error(error.message);
    }
  }
};
