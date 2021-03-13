const path=require("path");
module.exports={
  getPath:(filename,dir_path)=>dir_path=="/"?filename:path.join(dir_path,filename)
};
