// global
process_id=null;

const fs=require("fs").promises;
const { getPath } = require("../functions/path_functions.js");


function send(obj)
{
  socket.send(JSON.stringify(obj));
}

function send_error(log = null, message="Something went wrong", type="failed")
{
  send({ process_id, type, message, log });
}

function send_success(message="Completed Successfully",reload=false,type="completed")
{
  send({ process_id, message, type, reload });
}

module.exports=operation=>{
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
    let name=operation.data.source.files[0];
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
    let name=operation.data.source.files[0];
    let new_path = getPath(name,operation.data.source.baseFolder);
    connection.writeFile(new_path,"")
    .then(()=>{
      send_success(`Created "${name}" Successfully`,true);
    }).catch(error=>{
      send_error(error.message);
    });
  }
};
