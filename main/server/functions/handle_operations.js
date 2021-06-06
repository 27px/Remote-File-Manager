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

function send_success(message="Completed Successfully",type="completed")
{
  send({ process_id, type });
}

module.exports=operation=>{
  process_id = operation.process_id;
  let connection=connections[operation.data.source.server];
  if(typeof connection === 'undefined')
  {
    send_error(null,"Not Connected to Server");
    return;
  }
  if(operation.type==='new-folder')
  {
    let new_path = `${operation.data.source.baseFolder}/New Folder ${operation.data.source.suggestedNumber}`;
    connection.sftp
    .mkdir(new_path)
    .then(()=>{
      send_success();
    }).catch(error=>{
      send_error(error.message);
    });
  }
  else if(operation.type==='new-file')
  {

  }
};
