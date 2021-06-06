// global
process_id=null;

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
  let connection = connections[operation.data.source.server];
  if(typeof connection === 'undefined')
  {
    return send_error(null,"Not Connected to Server");
  }
  if(operation.type==='new-folder')
  {
    let name=operation.data.source.files[0];
    let new_path = `${operation.data.source.baseFolder}/${name}`;
    connection.sftp
    .mkdir(new_path)
    .then(()=>{
      send_success(`Created "${name}" Successfully`,true);
    }).catch(error=>{
      send_error(error.message);
    });
  }
  else if(operation.type==='new-file')
  {
    let name=operation.data.source.files[0];
    let new_path = `${operation.data.source.baseFolder}/${name}`;
    connection.sftp
    .writeFile(new_path,"")
    .then(()=>{
      send_success(`Created "${name}" Successfully`,true);
    }).catch(error=>{
      send_error(error.message);
    });
  }
};
