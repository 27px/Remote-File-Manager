const path=require("path");

function normalize_path(dir_path)
{
  dir_path=path.normalize(dir_path) || "/"; // normalize path eg: a/b/c/.. -> a/b/
  dir_path=dir_path.replace(/\.$/,""); // path.normalize() adds a . on end some paths like drives, it is removed here
  dir_path=dir_path.replace(/\\/g,"/"); // slash replace \ -> /
  dir_path=dir_path.includes(":")?dir_path:(dir_path.startsWith("/")?dir_path:`/${dir_path}`); // adds slash in front if linux path (identified by colon : (only present in windows))
  return dir_path;
}

module.exports={
  normalize_path,
  getPath:(filename,dir_path)=>{
    dir_path=dir_path=="/"?filename:path.join(dir_path,filename);
    dir_path=normalize_path(dir_path);
    dir_path=dir_path.includes(":")?dir_path:(dir_path.startsWith('/')?dir_path:`/${dir_path}`);
    dir_path=dir_path.replace("://",":").replace(":/",":").replace(":","://"); // if collon(:) is present then it should be ://
    return dir_path;
  }
};
