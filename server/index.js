module.exports=()=>{
  const config=require("./config/config.json");
  const express=require("express");
  const app=express();
  // const http=require("http").Server(app);
  // const io=require("socket.io")(http);
  const path=require("path");

  // const fileUpload=require('express-fileupload');
  const chalk=require("chalk");

  const route=require("./routes/main");
  const cors=require("cors");
  const HOST=config.SERVER.HOST;
  const PORT=process.env.PORT || config.SERVER.PORT;


  // app.set("views","./views");
  // app.set("view engine","ejs");

  app.use(cors({
    origin:"*"
  }));

  app.use(express.json());
  app.use(express.urlencoded({extended:true}));
  // app.use(fileUpload());

  // app.use(session({
  //   secret:config.SESSION.SECRET,
  //   resave:false,
  //   saveUninitialized:false
  // }));

  // io.on("connection",socket=>{
  //   console.log(chalk.yellow("one user Connected"));
  //   socket.on("operation",data=>{
  //     console.log(data);
  //     socket.emit("resp","received");
  //   });
  //   // custom kill io server
  //   socket.on("force-kill-server",()=>{
  //     console.log("kill server");
  //     io.server.close();
  //   });
  //   socket.on("disconnect",()=>{
  //     console.log(chalk.red("one user disconnected"));
  //   });
  // });

  // app.use("/static",express.static(path.join(__dirname,"static")));
  app.use("/favicon.ico",express.static(path.join(__dirname,"favicon.ico")));

  app.use("/",route);

  app.listen(PORT,()=>{
    console.log(chalk.green.inverse(` Started server ${HOST} on port ${PORT} `));
  });

}
