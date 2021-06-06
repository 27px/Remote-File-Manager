const path=require("path");

function normalize_path(dir_path)
{
  dir_path=path.normalize(dir_path) || "/"; // normalize path eg: a/b/c/.. -> a/b/
  dir_path=dir_path.replace(/\.$/,""); // path.normalize() adds a . on end some paths like drives, it is removed here
  dir_path=dir_path.replace(/\\/g,"/"); // slash replace \ -> /
  return dir_path;
}

module.exports={
  normalize_path,
  getPath:(filename,dir_path)=>{
    dir_path=dir_path=="/"?filename:path.join(dir_path,filename);
    dir_path=normalize_path(dir_path);
    dir_path=dir_path.includes(":")?dir_path:(dir_path.startsWith('/')?dir_path:`/${dir_path}`);
    return dir_path;
  }
};
